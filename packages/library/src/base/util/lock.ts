export class Lock {
  private promise!: Promise<any>
  private resolve!: Function

  constructor() {
    this.acquire()
  }

  wait() {
    return this.promise
  }

  acquire() {
    this.promise = new Promise(resolve => {
      this.resolve = resolve
    })
    return this.promise
  }

  release(result?: any) {
    this.resolve(result)
  }
}
