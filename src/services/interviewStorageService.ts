import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { initializeApp, getApps, getApp } from 'firebase/app';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
let firebaseStorage: any = null;

try {
  firebaseStorage = getStorage(app);
} catch (err) {
  console.warn("Firebase storage init warning:", err);
}

const DB_NAME = 'GestRH_InterviewRecordings_DB';
const STORE_NAME = 'recordings';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported in this browser environment."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface InterviewRecordingsData {
  videoBlob?: Blob;
  audioRecrutadorBlob?: Blob;
  audioCandidatoBlob?: Blob;
  transcriptText?: string;
}

export interface StoredRecordingsUrls {
  videoUrl: string;
  audioRecrutadorUrl: string;
  audioCandidatoUrl: string;
  transcriptTxtUrl: string;
}

export class InterviewStorageService {
  /**
   * SaveBlobsLocally stores Blobs in IndexedDB and creates Object URLs
   */
  public static async saveLocally(
    candidateId: string,
    interviewId: string,
    data: InterviewRecordingsData
  ): Promise<StoredRecordingsUrls> {
    const keyPrefix = `interviews_${candidateId}_${interviewId}`;
    const resultUrls: Partial<StoredRecordingsUrls> = {};

    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      if (data.videoBlob) {
        store.put(data.videoBlob, `${keyPrefix}_video`);
        resultUrls.videoUrl = URL.createObjectURL(data.videoBlob);
      }
      if (data.audioRecrutadorBlob) {
        store.put(data.audioRecrutadorBlob, `${keyPrefix}_audio_recrutador`);
        resultUrls.audioRecrutadorUrl = URL.createObjectURL(data.audioRecrutadorBlob);
      }
      if (data.audioCandidatoBlob) {
        store.put(data.audioCandidatoBlob, `${keyPrefix}_audio_candidato`);
        resultUrls.audioCandidatoUrl = URL.createObjectURL(data.audioCandidatoBlob);
      }
      if (data.transcriptText) {
        const txtBlob = new Blob([data.transcriptText], { type: 'text/plain;charset=utf-8' });
        store.put(txtBlob, `${keyPrefix}_transcript`);
        resultUrls.transcriptTxtUrl = URL.createObjectURL(txtBlob);
      }

      await new Promise((resolve) => {
        tx.oncomplete = resolve;
      });
    } catch (err) {
      console.warn("IndexedDB save fallback warning:", err);
      // Fallback: create temporary Object URLs from blobs
      if (data.videoBlob) resultUrls.videoUrl = URL.createObjectURL(data.videoBlob);
      if (data.audioRecrutadorBlob) resultUrls.audioRecrutadorUrl = URL.createObjectURL(data.audioRecrutadorBlob);
      if (data.audioCandidatoBlob) resultUrls.audioCandidatoUrl = URL.createObjectURL(data.audioCandidatoBlob);
      if (data.transcriptText) {
        const txtBlob = new Blob([data.transcriptText], { type: 'text/plain;charset=utf-8' });
        resultUrls.transcriptTxtUrl = URL.createObjectURL(txtBlob);
      }
    }

    return {
      videoUrl: resultUrls.videoUrl || '',
      audioRecrutadorUrl: resultUrls.audioRecrutadorUrl || '',
      audioCandidatoUrl: resultUrls.audioCandidatoUrl || '',
      transcriptTxtUrl: resultUrls.transcriptTxtUrl || ''
    };
  }

  /**
   * Upload to Firebase Storage under `interviews/{candidato_id}/{entrevista_id}/`
   */
  public static async uploadToFirebaseStorage(
    candidateId: string,
    interviewId: string,
    data: InterviewRecordingsData
  ): Promise<Partial<StoredRecordingsUrls>> {
    if (!firebaseStorage) {
      console.warn("Firebase Storage client not initialized, skipping cloud storage upload.");
      return {};
    }

    const basePath = `interviews/${candidateId}/${interviewId}`;
    const cloudUrls: Partial<StoredRecordingsUrls> = {};

    try {
      // 1. Upload Video MP4 / WebM
      if (data.videoBlob) {
        const videoRef = ref(firebaseStorage, `${basePath}/video.mp4`);
        await uploadBytes(videoRef, data.videoBlob, { contentType: data.videoBlob.type || 'video/mp4' });
        cloudUrls.videoUrl = await getDownloadURL(videoRef);
      }

      // 2. Upload Recruiter Audio WAV / WebM
      if (data.audioRecrutadorBlob) {
        const audioRecRef = ref(firebaseStorage, `${basePath}/audio_recrutador.wav`);
        await uploadBytes(audioRecRef, data.audioRecrutadorBlob, { contentType: data.audioRecrutadorBlob.type || 'audio/wav' });
        cloudUrls.audioRecrutadorUrl = await getDownloadURL(audioRecRef);
      }

      // 3. Upload Candidate Audio WAV / WebM
      if (data.audioCandidatoBlob) {
        const audioCandRef = ref(firebaseStorage, `${basePath}/audio_candidato.wav`);
        await uploadBytes(audioCandRef, data.audioCandidatoBlob, { contentType: data.audioCandidatoBlob.type || 'audio/wav' });
        cloudUrls.audioCandidatoUrl = await getDownloadURL(audioCandRef);
      }

      // 4. Upload Transcript Text
      if (data.transcriptText) {
        const txtBlob = new Blob([data.transcriptText], { type: 'text/plain;charset=utf-8' });
        const txtRef = ref(firebaseStorage, `${basePath}/transcript.txt`);
        await uploadBytes(txtRef, txtBlob, { contentType: 'text/plain' });
        cloudUrls.transcriptTxtUrl = await getDownloadURL(txtRef);
      }
    } catch (err) {
      console.warn("Firebase Storage upload error (using local storage fallback):", err);
    }

    return cloudUrls;
  }

  /**
   * Save recording package completely (Local + Cloud if available)
   */
  public static async saveInterviewRecordings(
    candidateId: string,
    interviewId: string,
    data: InterviewRecordingsData
  ): Promise<StoredRecordingsUrls> {
    const localUrls = await this.saveLocally(candidateId, interviewId, data);
    const cloudUrls = await this.uploadToFirebaseStorage(candidateId, interviewId, data);

    return {
      videoUrl: cloudUrls.videoUrl || localUrls.videoUrl,
      audioRecrutadorUrl: cloudUrls.audioRecrutadorUrl || localUrls.audioRecrutadorUrl,
      audioCandidatoUrl: cloudUrls.audioCandidatoUrl || localUrls.audioCandidatoUrl,
      transcriptTxtUrl: cloudUrls.transcriptTxtUrl || localUrls.transcriptTxtUrl
    };
  }

  /**
   * Retrieve stored Blobs from IndexedDB if needed
   */
  public static async getStoredBlobs(
    candidateId: string,
    interviewId: string
  ): Promise<InterviewRecordingsData> {
    const keyPrefix = `interviews_${candidateId}_${interviewId}`;
    const result: InterviewRecordingsData = {};

    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      const getBlob = (key: string): Promise<Blob | undefined> => {
        return new Promise((res) => {
          const req = store.get(key);
          req.onsuccess = () => res(req.result);
          req.onerror = () => res(undefined);
        });
      };

      result.videoBlob = await getBlob(`${keyPrefix}_video`);
      result.audioRecrutadorBlob = await getBlob(`${keyPrefix}_audio_recrutador`);
      result.audioCandidatoBlob = await getBlob(`${keyPrefix}_audio_candidato`);
      const txtBlob = await getBlob(`${keyPrefix}_transcript`);
      if (txtBlob) {
        result.transcriptText = await txtBlob.text();
      }
    } catch (e) {
      console.warn("Error getting blobs from IndexedDB:", e);
    }

    return result;
  }
}
