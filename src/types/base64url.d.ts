declare module "base64url" {
  function base64url(input: string | Buffer, encoding?: string): string;
  namespace base64url {
    function encode(input: string | Buffer, encoding?: string): string;
    function decode(input: string, encoding?: string): string;
    function toBase64(input: string | Buffer): string;
    function fromBase64(input: string): string;
    function toBuffer(input: string): Buffer;
  }
  export = base64url;
}
