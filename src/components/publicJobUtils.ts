/**
 * Utility functions for Public Job Pages (Página Pública da Vaga)
 */

import { Job } from '../types';

export const DEFAULT_BANNERS = {
  TI: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  Comercial: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
  'Recursos Humanos': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  Financeiro: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
  Logística: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  Default: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
};

export const DEFAULT_COMPANY_LOGOS = {
  Default: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'
};

export function generateJobSlug(title: string, id: string): string {
  const cleanTitle = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with -
    .replace(/^-+|-+$/g, ''); // trim hyphens

  const shortId = id.replace(/[^a-zA-Z0-9]/g, '').slice(-5) || '001';
  return `${cleanTitle}-${shortId}`;
}

export function getPublicJobUrl(job: Job): string {
  const slug = job.slug || generateJobSlug(job.title, job.id);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?vaga=${slug}`;
}

export function getDefaultBanner(department?: string): string {
  if (!department) return DEFAULT_BANNERS.Default;
  const deptLower = department.toLowerCase();
  if (deptLower.includes('ti') || deptLower.includes('tech') || deptLower.includes('desenvolv')) {
    return DEFAULT_BANNERS.TI;
  }
  if (deptLower.includes('comercial') || deptLower.includes('vendas')) {
    return DEFAULT_BANNERS.Comercial;
  }
  if (deptLower.includes('rh') || deptLower.includes('humanos') || deptLower.includes('recrutamento')) {
    return DEFAULT_BANNERS['Recursos Humanos'];
  }
  if (deptLower.includes('finan') || deptLower.includes('contab')) {
    return DEFAULT_BANNERS.Financeiro;
  }
  if (deptLower.includes('log') || deptLower.includes('operac')) {
    return DEFAULT_BANNERS.Logística;
  }
  return DEFAULT_BANNERS.Default;
}

/**
 * Increment job view, click, or application analytics in local storage
 */
export function trackJobMetric(
  jobId: string, 
  metric: 'views' | 'clicks' | 'applications', 
  source: string = 'Direct'
) {
  try {
    const rawJobs = localStorage.getItem('firebase_jobs') || localStorage.getItem('JOBS');
    if (!rawJobs) return;
    const jobs: Job[] = JSON.parse(rawJobs);
    
    const updated = jobs.map(j => {
      if (j.id === jobId || j.slug === jobId) {
        const current = j.analytics || { views: 0, clicks: 0, applications: 0, sources: {} };
        const sources = current.sources || {};
        sources[source] = (sources[source] || 0) + 1;

        return {
          ...j,
          analytics: {
            ...current,
            [metric]: (current[metric] || 0) + 1,
            sources
          }
        };
      }
      return j;
    });

    localStorage.setItem('firebase_jobs', JSON.stringify(updated));
    localStorage.setItem('JOBS', JSON.stringify(updated));
    window.dispatchEvent(new Event('jobsUpdated'));
  } catch (e) {
    console.error('Error tracking metric:', e);
  }
}
