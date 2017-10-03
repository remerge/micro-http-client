declare module 'micro-http-client' {
  export interface ResponseReducer extends Function {
    (response: any): any
  }

  export interface RequestReducer extends Function {
    (request: Object): Object | Promise<Object>
  }

  interface Config {
    requestReducers: RequestReducer[],
    responseReducers: ResponseReducer[],
  }

  interface Headers {
    [name: string]: string;
  }

  interface HeaderBuilder extends Function {
    ():Promise<Headers>;
  }

  interface BodyProcessor extends Function {
    (body: string):any;
  }

  interface Fetch extends Function {
    (path: string):Promise<any>;
  }

  export function createFetch(config: Config):Fetch;
  export function prependHost(host: string): RequestReducer;
  export function addHeaders(headers: HeaderBuilder | Headers): RequestReducer;
  export function processBody(processor: BodyProcessor): RequestReducer;

  export function rejectIfUnsuccessful(response: Response):Response;
}
