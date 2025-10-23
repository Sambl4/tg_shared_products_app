import { inject, Injectable } from '@angular/core';
import { HttpService, IPostPayload, PostMethods } from './http.service';

export interface IUser {
  id: number;
  name: string;
  productListId: string;
  productListName: string;
  presetListId: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private _httpService = inject(HttpService);

  joinGroup(user: IUser): Promise<boolean> {
    const payload: IPostPayload = {
      method: PostMethods.USER_UPDATE,
      body: {
        data: user,
        id: user.productListId,
      }
    }

    // return new Promise((resolve) => {
    //   setTimeout(() => resolve(true), 1000);
    // })
    return this._httpService.post(payload)
      .then(resp => resp.ok)
      .catch(() => false);
  }
}
