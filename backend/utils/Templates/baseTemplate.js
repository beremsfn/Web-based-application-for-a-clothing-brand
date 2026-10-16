const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body style="font-family: Arial; background:#f4f6f8; padding:20px">
    <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:6px">
      ${content}
      <p style="font-size:12px;color:#777;text-align:center;margin-top:30px">
        © ${new Date().getFullYear()} ACRS Registrar Office
      </p>
    </div>
  </body>
</html>
`;

export default baseTemplate;


