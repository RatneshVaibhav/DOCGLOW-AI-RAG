// @types/pdf-parse only declares the "pdf-parse" package root. We import the
// implementation file directly (see src/lib/pdf.ts for why), so re-export the
// same default type for that subpath.
declare module "pdf-parse/lib/pdf-parse.js" {
  import pdfParse from "pdf-parse";
  export default pdfParse;
}
