/**
 * RL CONNECT - Interview Storage Service
 * Clean local IndexedDB and Object URL storage for interview audio, video, and transcripts.
 * NO FIREBASE DEPENDENCIES.
 */

const DB_NAME = 'RLCONNECT_InterviewRecordings_DB';
const STORE_NAME = 'recordings';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
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

  public static async saveInterviewRecordings(
    candidateId: string,
    interviewId: string,
    data: InterviewRecordingsData
  ): Promise<StoredRecordingsUrls> {
    return this.saveLocally(candidateId, interviewId, data);
  }

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
