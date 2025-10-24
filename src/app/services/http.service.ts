import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum RequestedDataType {
  PRODUCTS = 'products',
  GROUPS = 'groups',
  PRESETS = 'presets',
}

export interface IGetParams {
  type?: RequestedDataType;
  id?: string;
}

export interface IPostPayload {
  method: PostMethods;
  body: {
    data: any;
    id: string;
  };
}

export enum PostMethods {
  UPDATE = 'Update',
  CREATE = 'Create',
  DELETE = 'Delete',
  NOTIFY = 'Notify',
  USER_UPDATE = 'UserUpdate',
  PRESET_UPDATE = 'PresetUpdate',
  GENERATE_PRESET = 'GeneratePreset',
}

@Injectable({
  providedIn: 'root'
})

export class HttpService {
  get(params: IGetParams): Promise<Response> {
    const queries = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return fetch(`${environment.apiUrl}?${queries}`);
  }

  post(payload: IPostPayload): Promise<Response> {
    const options = {
      method: 'POST',
      body: JSON.stringify({
        method: payload.method,
        data: payload.body.data,
        id: payload.body.id,
      }),
    }

    return fetch(`${environment.apiUrl}`, options)
  }
}
