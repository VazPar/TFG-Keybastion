import api from './api';
import type { Credential } from '../types';

export interface Owner {
  id: string;
  username: string;
}

export interface SharedCredential extends Credential {
  owner: Owner;
  isOwner: boolean;
  sharedBy?: Owner;
  sharingId?: string;
}

export interface CredentialsResponse {
  ownCredentials: SharedCredential[];
  sharedCredentials: SharedCredential[];
}

export interface ShareCredentialRequest {
  credentialId: string;
  sharedWithUserId: string;
  expirationDate?: string;
  securityPin: string;
}

export interface SharingInfo {
  id: string;
  username: string;
  hasPinSetup: boolean;
}

export interface SharedCredentialDetail {
  sharingId: string;
  credentialId: string;
  accountName: string;
  serviceUrl: string;
  notes?: string;
  sharedByUserId: string;
  sharedByUsername: string;
  sharedWithUserId: string;
  sharedWithUsername: string;
  expirationDate: string;
  isAccepted: boolean;
}

class SharingService {
  public async getCurrentUserSharingInfo(): Promise<SharingInfo> {
    return api.get('/api/sharing/me');
  }

  public async shareCredential(request: ShareCredentialRequest): Promise<{ message: string; sharingId: string }> {
    return api.post('/api/sharing/share', request);
  }

  public async getCredentialsSharedByMe(): Promise<SharedCredentialDetail[]> {
    return api.get('/api/sharing/shared-by-me');
  }

  public async getCredentialsSharedWithMe(): Promise<SharedCredentialDetail[]> {
    return api.get('/api/sharing/shared-with-me');
  }

  public async acceptSharing(sharingId: string, securityPin: string): Promise<{ message: string }> {
    return api.post(`/api/sharing/${sharingId}/accept`, { securityPin });
  }

  public async removeSharing(sharingId: string, securityPin: string): Promise<{ message: string }> {
    return api.delete(`/api/sharing/${sharingId}`, { data: { securityPin } });
  }

  public async decryptSharedPassword(sharingId: string, securityPin: string): Promise<{ password: string }> {
    return api.post(`/api/sharing/${sharingId}/decrypt`, { securityPin });
  }
}

export const sharingService = new SharingService();
