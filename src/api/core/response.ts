export class Response {
  static ok(data: any = null, message: string = "ok") {
    return {
      status: true,
      message,
      data,
    };
  }

  static fail(data: any = null, message: string = "error") {
    return {
      status: false,
      message,
      data,
    };
  }
}
