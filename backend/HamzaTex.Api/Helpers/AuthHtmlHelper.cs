namespace HamzaTex.Api.Helpers;

public static class AuthHtmlHelper
{
    // ── Brand constants ──────────────────────────────────────────────────────
    private const string Navy     = "#0f172a";
    private const string NavyMid  = "#1e293b";
    private const string Teal     = "#0891b2";
    private const string TealPale = "#e0f2fe";
    private const string TealText = "#a5f3fc";
    private const string SlateLight = "#f1f5f9";
    private const string SlateText  = "#475569";
    private const string TextDark   = "#0f172a";
    private const string TextMid    = "#334155";

    // ────────────────────────────────────────────────────────────────────────
    #region Email Templates
    // ────────────────────────────────────────────────────────────────────────

    public static string GetConfirmEmailTemplateHtml(string link, string expirationMinutes) =>
        BuildEmailTemplate(
            title:       "Confirm Your Email – Hamza Tex",
            heading:     "Welcome to Hamza Tex!",
            bodyLines: [
                "Thank you for joining our textile community. We're excited to have you on board.",
                "To activate your account, confirm your email address by clicking the button below:"
            ],
            buttonText:  "Confirm Email Address",
            buttonColor: Teal,
            link:        link,
            noticeLines: [
                $"⏱  This link expires in <strong>{expirationMinutes} minutes</strong>.",
                "If you didn't create a Hamza Tex account, you can safely ignore this email."
            ]);

    public static string GetResetPasswordEmailTemplateHtml(string link, string expirationMinutes) =>
        BuildEmailTemplate(
            title:       "Reset Your Password – Hamza Tex",
            heading:     "Password Reset Request",
            bodyLines: [
                "We received a request to reset the password for your Hamza Tex account.",
                "Click the button below to choose a new password. If you did not request this, no action is needed."
            ],
            buttonText:  "Reset My Password",
            buttonColor: "#dc2626",   // Red — signals a security action
            link:        link,
            noticeLines: [
                $"⏱  This link expires in <strong>{expirationMinutes} minutes</strong>.",
                "If you didn't request a password reset, your account is safe — ignore this email."
            ]);

    public static string GetOtpEmailHtml(string code, string expirationMinutes)
    {
        var digits = string.Concat(code.Select(d =>
            $"<span style=\"display:inline-block;width:44px;height:56px;line-height:56px;" +
            $"text-align:center;font-size:28px;font-weight:700;color:{Navy};" +
            $"background:#f8fafc;border:2px solid #cbd5e1;border-radius:8px;margin:0 4px;\">" +
            $"{d}</span>"));

        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width,initial-scale=1.0"">
  <title>Your Verification Code – Hamza Tex</title>
</head>
<body style=""margin:0;padding:0;background-color:{SlateLight};font-family:Arial,Helvetica,sans-serif;"">

  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" bgcolor=""{SlateLight}"">
    <tr>
      <td align=""center"" style=""padding:48px 20px;"">

        <table width=""520"" cellpadding=""0"" cellspacing=""0""
               style=""max-width:520px;width:100%;border-radius:12px;overflow:hidden;
                       box-shadow:0 8px 32px rgba(0,0,0,0.12);"">

          <!-- Header -->
          <tr>
            <td bgcolor=""{Navy}"" style=""padding:28px 36px 18px;background-color:{Navy};"">
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td valign=""middle"">
                    <span style=""font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;"">Hamza Tex</span>
                    <br>
                    <span style=""font-size:11px;color:{TealText};font-style:italic;"">Weaving Quality. Delivering Trust.</span>
                  </td>
                  <td align=""right"" valign=""top"">
                    <span style=""display:inline-block;border:1.5px solid {Teal};padding:5px 9px;
                                   font-size:8px;font-weight:700;color:{TealText};letter-spacing:1.2px;"">OFFICIAL</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Teal rule -->
          <tr>
            <td height=""4"" bgcolor=""{Teal}"" style=""background-color:{Teal};font-size:0;line-height:0;"">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td bgcolor=""#ffffff"" style=""padding:36px 36px 8px;background-color:#ffffff;"">
              <h2 style=""margin:0 0 12px;font-size:20px;font-weight:700;color:{TextDark};"">Password Reset Code</h2>
              <p style=""margin:0 0 24px;font-size:15px;color:{TextMid};line-height:1.7;"">
                Use the code below in the Hamza Tex app to reset your password.
                Do not share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- OTP block -->
          <tr>
            <td bgcolor=""#ffffff"" style=""padding:0 36px 32px;background-color:#ffffff;"">
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td align=""center"" bgcolor=""#f1f5f9""
                      style=""background-color:#f1f5f9;border-radius:10px;padding:28px 20px;"">
                    <div style=""margin-bottom:12px;font-size:12px;font-weight:700;color:#64748b;letter-spacing:1.4px;"">
                      VERIFICATION CODE
                    </div>
                    <div style=""line-height:1;"">{digits}</div>
                    <div style=""margin-top:16px;font-size:12px;color:#94a3b8;"">
                      ⏱ &nbsp;Expires in <strong>{expirationMinutes} minutes</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td bgcolor=""#ffffff"" style=""padding:0 36px 32px;background-color:#ffffff;"">
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td bgcolor=""{TealPale}""
                      style=""background-color:{TealPale};border:1px solid #bae6fd;border-radius:8px;padding:14px 18px;"">
                    <p style=""margin:0 0 6px;font-size:12px;color:#0369a1;line-height:1.6;"">
                      🔒 &nbsp;If you didn't request this, your account is safe — ignore this email.
                    </p>
                    <p style=""margin:0;font-size:12px;color:#0369a1;line-height:1.6;"">
                      Never share your code with anyone, including Hamza Tex support.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor=""{NavyMid}"" style=""padding:18px 36px;background-color:{NavyMid};"">
              <p style=""margin:0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.6;"">
                © {DateTime.UtcNow.Year} Hamza Tex · This is an automated security email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>";
    }

    private static string BuildEmailTemplate(
        string   title,
        string   heading,
        string[] bodyLines,
        string   buttonText,
        string   buttonColor,
        string   link,
        string[] noticeLines)
    {
        var bodyHtml   = string.Concat(bodyLines.Select(l =>
            $"<p style=\"margin:0 0 12px;font-size:15px;color:{TextMid};line-height:1.7;\">{l}</p>"));
        var noticeHtml = string.Concat(noticeLines.Select(l =>
            $"<p style=\"margin:0 0 6px;font-size:12px;color:#0369a1;line-height:1.6;\">{l}</p>"));

        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width,initial-scale=1.0"">
  <title>{title}</title>
</head>
<body style=""margin:0;padding:0;background-color:{SlateLight};font-family:Arial,Helvetica,sans-serif;"">

  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" bgcolor=""{SlateLight}"">
    <tr>
      <td align=""center"" style=""padding:48px 20px;"">

        <!-- ── Card ── -->
        <table width=""600"" cellpadding=""0"" cellspacing=""0""
               style=""max-width:600px;width:100%;border-radius:12px;overflow:hidden;
                       box-shadow:0 8px 32px rgba(0,0,0,0.12);"">

          <!-- ── Header: navy ── -->
          <tr>
            <td bgcolor=""{Navy}"" style=""padding:32px 40px 20px;background-color:{Navy};"">
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td valign=""middle"">
                    <span style=""font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;"">Hamza Tex</span>
                    <br>
                    <span style=""font-size:11px;color:{TealText};font-style:italic;"">Weaving Quality. Delivering Trust.</span>
                  </td>
                  <td align=""right"" valign=""top"">
                    <span style=""display:inline-block;border:1.5px solid {Teal};padding:5px 9px;
                                   font-size:8px;font-weight:700;color:{TealText};letter-spacing:1.2px;"">
                      OFFICIAL
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Teal rule ── -->
          <tr>
            <td height=""4"" bgcolor=""{Teal}""
                style=""background-color:{Teal};font-size:0;line-height:0;"">&nbsp;</td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td bgcolor=""#ffffff"" style=""padding:40px 40px 8px;background-color:#ffffff;"">
              <h2 style=""margin:0 0 20px;font-size:22px;font-weight:700;color:{TextDark};"">
                {heading}
              </h2>
              {bodyHtml}
            </td>
          </tr>

          <!-- ── CTA button ── -->
          <tr>
            <td bgcolor=""#ffffff"" style=""padding:24px 40px 32px;background-color:#ffffff;"">
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td align=""center"">
                    <a href=""{link}""
                       style=""display:inline-block;background-color:{buttonColor};color:#ffffff;
                               text-decoration:none;font-size:15px;font-weight:700;
                               padding:15px 48px;border-radius:8px;letter-spacing:0.3px;"">
                      {buttonText}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align=""center"" style=""padding-top:16px;"">
                    <span style=""font-size:11px;color:#94a3b8;"">
                      Button not working?&nbsp;
                      <a href=""{link}"" style=""color:{Teal};word-break:break-all;font-size:11px;"">
                        Copy this link
                      </a>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Notice panel ── -->
          <tr>
            <td bgcolor=""#ffffff"" style=""padding:0 40px 36px;background-color:#ffffff;"">
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td bgcolor=""{TealPale}""
                      style=""background-color:{TealPale};border:1px solid #bae6fd;
                               border-radius:8px;padding:16px 20px;"">
                    {noticeHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Divider ── -->
          <tr>
            <td bgcolor=""#ffffff"" style=""padding:0 40px;"">
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td height=""1"" bgcolor=""#e2e8f0""
                      style=""background-color:#e2e8f0;font-size:0;line-height:0;"">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Footer: navy ── -->
          <tr>
            <td bgcolor=""{Navy}"" style=""padding:28px 40px;background-color:{Navy};"">
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td>
                    <span style=""font-size:12px;color:#64748b;"">
                      G.T. 6/18/19, Old Town, Kagzi Bazar, Karachi, Pakistan
                    </span><br>
                    <span style=""font-size:12px;color:#64748b;"">
                      0313-2039333&nbsp;&nbsp;|&nbsp;&nbsp;hamzatex007@gmail.com
                    </span>
                  </td>
                </tr>
                <tr>
                  <td height=""1"" bgcolor=""{NavyMid}""
                      style=""background-color:{NavyMid};font-size:0;line-height:0;padding-top:16px;"">&nbsp;</td>
                </tr>
                <tr>
                  <td style=""padding-top:14px;"" align=""center"">
                    <span style=""font-size:11px;color:#475569;"">
                      &copy; {DateTime.Now.Year} Hamza Tex. All rights reserved.
                    </span>
                    &nbsp;&middot;&nbsp;
                    <span style=""font-size:11px;color:#475569;"">
                      Automated message — do not reply.
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

        <p style=""color:#94a3b8;font-size:11px;text-align:center;margin-top:20px;"">
          You received this email because an action was performed on your Hamza Tex account.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>";
    }

    #endregion

    // ────────────────────────────────────────────────────────────────────────
    #region Web Pages (shown when user clicks email links)
    // ────────────────────────────────────────────────────────────────────────

    public static string GetConfirmEmailHtml(bool success, string message)
    {
        var iconBg    = success ? "#dcfce7" : "#fee2e2";
        var iconColor = success ? "#16a34a" : "#dc2626";
        var icon      = success ? "✓" : "✕";
        var heading   = success ? "Email Confirmed!" : "Confirmation Failed";

        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width,initial-scale=1.0"">
  <title>{heading} – Hamza Tex</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; }}
    body {{
      margin: 0; padding: 0;
      background: {SlateLight};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .card {{
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      padding: 0;
      max-width: 460px;
      width: 90%;
      overflow: hidden;
    }}
    .card-header {{
      background: {Navy};
      padding: 28px 36px;
      border-bottom: 4px solid {Teal};
    }}
    .brand {{ font-size: 22px; font-weight: 700; color: #fff; }}
    .tagline {{ font-size: 11px; color: {TealText}; font-style: italic; margin-top: 2px; }}
    .card-body {{
      padding: 40px 36px;
      text-align: center;
    }}
    .icon-circle {{
      width: 72px; height: 72px;
      border-radius: 50%;
      background: {iconBg};
      color: {iconColor};
      font-size: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }}
    .heading {{ font-size: 22px; font-weight: 700; color: {TextDark}; margin: 0 0 12px; }}
    .message-text {{ font-size: 15px; color: {SlateText}; line-height: 1.6; margin: 0 0 28px; }}
    .note {{ font-size: 12px; color: #94a3b8; }}
    .card-footer {{
      background: {SlateLight};
      padding: 16px 36px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }}
  </style>
</head>
<body>
  <div class=""card"">
    <div class=""card-header"">
      <div class=""brand"">Hamza Tex</div>
      <div class=""tagline"">Weaving Quality. Delivering Trust.</div>
    </div>
    <div class=""card-body"">
      <div class=""icon-circle"">{icon}</div>
      <h1 class=""heading"">{heading}</h1>
      <p class=""message-text"">{message}</p>
      <p class=""note"">You can close this page and return to the Hamza Tex app.</p>
    </div>
    <div class=""card-footer"">
      &copy; {DateTime.Now.Year} Hamza Tex &nbsp;&middot;&nbsp; hamzatex007@gmail.com
    </div>
  </div>
</body>
</html>";
    }

    public static string GetResetPasswordPageHtml(string? email = null, string? code = null, string? error = null)
    {
        if (error != null)
            return BuildResetErrorPage(error);

        var emailSafe = System.Net.WebUtility.HtmlEncode(email ?? "");
        var codeSafe  = System.Net.WebUtility.HtmlEncode(code  ?? "");

        return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width,initial-scale=1.0"">
  <title>Reset Password – Hamza Tex</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; }}
    body {{
      margin: 0; padding: 0;
      background: {SlateLight};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .card {{
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      max-width: 440px;
      width: 90%;
      overflow: hidden;
    }}
    .card-header {{
      background: {Navy};
      padding: 28px 36px;
      border-bottom: 4px solid {Teal};
    }}
    .brand {{ font-size: 22px; font-weight: 700; color: #fff; }}
    .tagline {{ font-size: 11px; color: {TealText}; font-style: italic; margin-top: 2px; }}
    .card-body {{ padding: 36px; }}
    .card-body h1 {{
      font-size: 20px; font-weight: 700;
      color: {TextDark}; margin: 0 0 6px;
    }}
    .card-body .subtitle {{
      font-size: 13px; color: {SlateText}; margin: 0 0 28px; line-height: 1.5;
    }}
    label {{
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: {TextMid};
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    input[type=""password""] {{
      width: 100%;
      padding: 12px 14px;
      font-size: 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 16px;
      transition: border-color 0.2s;
      color: {TextDark};
      background: #fff;
      outline: none;
    }}
    input[type=""password""]:focus {{ border-color: {Teal}; box-shadow: 0 0 0 3px {TealPale}; }}
    button[type=""submit""] {{
      width: 100%;
      padding: 13px;
      background: {Teal};
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 4px;
      transition: background 0.2s;
    }}
    button[type=""submit""]:hover {{ background: #0e7490; }}
    button[type=""submit""]:disabled {{ opacity: 0.6; cursor: not-allowed; }}
    .msg {{
      margin-top: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
      display: none;
    }}
    .msg.success {{ background: #dcfce7; color: #15803d; border: 1px solid #86efac; }}
    .msg.error   {{ background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }}
    .card-footer {{
      background: {SlateLight};
      padding: 14px 36px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }}
  </style>
</head>
<body>
  <div class=""card"">
    <div class=""card-header"">
      <div class=""brand"">Hamza Tex</div>
      <div class=""tagline"">Weaving Quality. Delivering Trust.</div>
    </div>
    <div class=""card-body"">
      <h1>Reset Your Password</h1>
      <p class=""subtitle"">Enter and confirm your new password below. Minimum 8 characters.</p>

      <form id=""resetForm"" novalidate>
        <input type=""hidden"" id=""email"" value=""{emailSafe}"">
        <input type=""hidden"" id=""code""  value=""{codeSafe}"">

        <label for=""newPassword"">New Password</label>
        <input type=""password"" id=""newPassword"" placeholder=""Enter new password"" required minlength=""8"">

        <label for=""confirmPassword"">Confirm Password</label>
        <input type=""password"" id=""confirmPassword"" placeholder=""Confirm new password"" required minlength=""8"">

        <button type=""submit"" id=""submitBtn"">Reset Password</button>
      </form>

      <div id=""msg"" class=""msg""></div>
    </div>
    <div class=""card-footer"">
      &copy; {DateTime.Now.Year} Hamza Tex &nbsp;&middot;&nbsp; hamzatex007@gmail.com
    </div>
  </div>

  <script>
    const form    = document.getElementById('resetForm');
    const msgEl   = document.getElementById('msg');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {{
      e.preventDefault();
      msgEl.style.display = 'none';

      const email   = document.getElementById('email').value;
      const code    = document.getElementById('code').value;
      const newPw   = document.getElementById('newPassword').value;
      const confirm = document.getElementById('confirmPassword').value;

      if (newPw !== confirm) {{
        showMsg('error', 'Passwords do not match. Please try again.');
        return;
      }}
      if (newPw.length < 8) {{
        showMsg('error', 'Password must be at least 8 characters.');
        return;
      }}

      submitBtn.disabled = true;
      submitBtn.textContent = 'Resetting…';

      try {{
        const res  = await fetch('/api/auth/reset-password', {{
          method:  'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body:    JSON.stringify({{ email, token: code, newPassword: newPw, confirmPassword: confirm }})
        }});
        const data = await res.json();

        if (data.success) {{
          form.style.display = 'none';
          showMsg('success', 'Password reset successfully! You can close this page and return to the app.');
        }} else {{
          showMsg('error', data.message || (data.errors && data.errors[0]) || 'Reset failed. Please try again.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Reset Password';
        }}
      }} catch {{
        showMsg('error', 'Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reset Password';
      }}
    }});

    function showMsg(type, text) {{
      msgEl.className = 'msg ' + type;
      msgEl.textContent = text;
      msgEl.style.display = 'block';
    }}
  </script>
</body>
</html>";
    }

    private static string BuildResetErrorPage(string error) => $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width,initial-scale=1.0"">
  <title>Invalid Link – Hamza Tex</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; }}
    body {{
      margin: 0; padding: 0;
      background: {SlateLight};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
    }}
    .card {{
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      max-width: 420px; width: 90%; overflow: hidden;
    }}
    .card-header {{
      background: {Navy}; padding: 28px 36px;
      border-bottom: 4px solid #dc2626;
    }}
    .brand {{ font-size: 22px; font-weight: 700; color: #fff; }}
    .card-body {{ padding: 40px 36px; text-align: center; }}
    .icon {{
      width: 64px; height: 64px; border-radius: 50%;
      background: #fee2e2; color: #dc2626;
      font-size: 30px; display: flex;
      align-items: center; justify-content: center;
      margin: 0 auto 20px;
    }}
    h1 {{ font-size: 20px; font-weight: 700; color: {TextDark}; margin: 0 0 12px; }}
    p  {{ font-size: 14px; color: {SlateText}; margin: 0; line-height: 1.6; }}
    .card-footer {{
      background: {SlateLight}; padding: 14px 36px;
      text-align: center; font-size: 11px; color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }}
  </style>
</head>
<body>
  <div class=""card"">
    <div class=""card-header"">
      <div class=""brand"">Hamza Tex</div>
    </div>
    <div class=""card-body"">
      <div class=""icon"">✕</div>
      <h1>Invalid or Expired Link</h1>
      <p>{error}</p>
    </div>
    <div class=""card-footer"">
      &copy; {DateTime.Now.Year} Hamza Tex &nbsp;&middot;&nbsp; hamzatex007@gmail.com
    </div>
  </div>
</body>
</html>";

    #endregion
}
