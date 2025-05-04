import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../environment/environment';
import { IComponentsResponse} from '../models/components/components-response';
import { StorageService } from './storage.service';
import { IComponentFolderThreeResponse, IComponentsFolderOneRequest, IComponentsFolderOneResponse, IComponentsFolderThreeRequest } from '../models/components-folder.ts/components-folder-one';
@Injectable({
  providedIn: 'root'
})
export class ComponentService {
  private apiUrl : string;
  name: string = '';
  constructor(private http: HttpClient
  ) { 
    this.apiUrl = environment.apiUrl + '/';
  }

  createComponent(body?: any, component?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}API/v1/component/${component}/`, body)
  }

  updateComponent(body?: any, component?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}API/v1/component/${component}/${body?.id}`, body)
  }

  deleteComponent(body: number, component?: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}API/v1/component/${component}/${body}`)
  }


  getTables(body?: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'API/v1/tables', body)
  }

  getColumns(name?: any, body?: any): Observable<any> {
    if (name){
      return this.http.post<any>(`${this.apiUrl}API/v1/tables/${name}/list`,body);
    } 
    else {
      return of([])
    } 
  }

  getComponentList(url?: any, body?: any): Observable<IComponentsResponse> {
    if (url){
    return this.http.post<IComponentsResponse>(`${this.apiUrl}API/v1/component/${url}/list/filtered`, body);
    }
    else{
      return of({
        total_count: 0,
        len: 0,
        offset: 0,
        component_list: []
      });
    }
  }

  getComponentsFolderOne(body?: IComponentsFolderOneRequest): Observable<IComponentsFolderOneResponse>{
    return this.http.post<IComponentsFolderOneResponse>(`${this.apiUrl}API/v1/libTree`,body);
  }

  getComponentsFolderTwo(component: string, body : IComponentsFolderOneRequest): Observable<IComponentsFolderOneResponse>{
    return this.http.post<IComponentsFolderOneResponse>(`${this.apiUrl}API/v1/libTree/${component}`,body);
  }

  getComponentsFolderThree(component: string, typeOfComponent : string, body : IComponentsFolderThreeRequest): Observable<IComponentFolderThreeResponse>{
    return this.http.post<IComponentFolderThreeResponse>(`${this.apiUrl}API/v1/libTree/${component}/${typeOfComponent}`,body);
  }
}
