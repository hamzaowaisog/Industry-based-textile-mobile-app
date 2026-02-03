using System.Linq;

namespace HamzaTex.Api.Helpers;


public static class AuthHtmlHelper
{
    #region Email Templates (sent via email)
    public static string GetConfirmEmailTemplateHtml(string link, string expirationMinutes)
    {
        return GetEmailTemplateHtml(
            title: "Confirm Your Email",
            heading: "Welcome to HamzaTex!",
            bodyLines: new[]
            {
                "Thank you for joining our textile community. We're thrilled to have you with us!",
                "To get started, please confirm your email address by clicking the button below:"
            },
            buttonText: "Confirm Email Address",
            link,
            footerLines: new[]
            {
                $"This link will expire in {expirationMinutes} minutes for security reasons.",
                "If you didn't create an account with HamzaTex, you can safely ignore this email."
            });
    }


    public static string GetResetPasswordEmailTemplateHtml(string link, string expirationMinutes)
    {
        return GetEmailTemplateHtml(
            title: "Reset Your Password",
            heading: "Password Reset Request",
            bodyLines: new[]
            {
                "We received a request to reset your password for your HamzaTex account.",
                "If you didn't make this request, please ignore this email. Otherwise, you can reset your password by clicking the button below:"
            },
            buttonText: "Reset Your Password",
            link,
            footerLines: new[]
            {
                $"This link will expire in {expirationMinutes} minutes for security reasons.",
                "If you didn't request a password reset, you can safely ignore this email."
            });
    }

    private static string GetEmailTemplateHtml(
        string title,
        string heading,
        string[] bodyLines,
        string buttonText,
        string link,
        string[] footerLines)
    {
        var bodyHtml = string.Join("", bodyLines.Select(l => $"<p>{l}</p>"));
        var footerHtml = string.Join("", footerLines.Select(l => $"<p>{l}</p>"));

        return $@"<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{title}</title>
    <style>
        body {{ font-family: 'Arial', sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0; }}
        table {{ width: 100%; border-collapse: collapse; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }}
        .header h1 {{ font-size: 30px; font-weight: 700; margin: 0; }}
        .header p {{ font-size: 16px; margin-top: 8px; opacity: 0.85; }}
        .body {{ padding: 40px; font-size: 16px; color: #4a5568; }}
        .body h2 {{ font-size: 26px; color: #2d3748; margin-bottom: 20px; font-weight: 600; }}
        .cta-button {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px 40px; border-radius: 6px; text-align: center; margin-top: 30px; }}
        .cta-button a {{ color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; }}
        .footer {{ background-color: #f7fafc; color: #718096; padding: 32px 40px; border-top: 1px solid #e2e8f0; font-size: 13px; text-align: center; }}
        .footer a {{ color: #667eea; text-decoration: none; }}
        .brand-footer {{ background-color: #ffffff; text-align: center; padding: 24px 40px; font-size: 12px; color: #a0aec0; }}
    </style>
</head>
<body>
    <table role='presentation'>
        <tr>
            <td style='padding: 40px 20px;'>
                <div class='container'>
                    <div class='header'>
                        <h1>HamzaTex</h1>
                        <p>Premium Textile Solutions</p>
                    </div>
                    <div class='body'>
                        <h2>{heading}</h2>
                        {bodyHtml}
                        <div class='cta-button'>
                            <a href='{link}'>{buttonText}</a>
                        </div>
                    </div>
                    <div class='footer'>
                        {footerHtml}
                    </div>
                    <div class='brand-footer'>
                        <p>© 2026 HamzaTex. All rights reserved.</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    #endregion

    #region Web Pages (returned when user clicks link)

    public static string GetConfirmEmailHtml(bool success, string message)
    {
        var color = success ? "#22c55e" : "#ef4444";
        var title = success ? "Email Confirmed" : "Confirmation Failed";
        return $@"<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{title} - HamzaTex</title>
    <style>
        body {{ font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f9fafb; }}
        .box {{ text-align: center; padding: 2rem; max-width: 400px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
        .message {{ color: {color}; font-size: 1.1rem; margin-bottom: 1rem; }}
        h1 {{ font-size: 1.5rem; color: #1f2937; margin-bottom: 0.5rem; }}
    </style>
</head>
<body>
    <div class='box'>
        <h1>{title}</h1>
        <p class='message'>{message}</p>
        <p style='color:#6b7280; font-size:0.9rem;'>You can close this page and return to the HamzaTex app.</p>
    </div>
</body>
</html>";
    }
    public static string GetResetPasswordPageHtml(string? email = null, string? code = null, string? error = null)
    {
        if (error != null)
        {
            return $@"<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Reset Password - HamzaTex</title>
    <style>
        body {{ font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f9fafb; }}
        .box {{ text-align: center; padding: 2rem; max-width: 400px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
        .error {{ color: #ef4444; font-size: 1rem; }}
    </style>
</head>
<body>
    <div class='box'>
        <h1>Invalid Link</h1>
        <p class='error'>{error}</p>
    </div>
</body>
</html>";
        }

        var emailSafe = System.Net.WebUtility.HtmlEncode(email ?? "");
        var codeSafe = System.Net.WebUtility.HtmlEncode(code ?? "");

        return $@"<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Reset Password - HamzaTex</title>
    <style>
        body {{ font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f9fafb; }}
        .box {{ padding: 2rem; max-width: 400px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
        h1 {{ font-size: 1.5rem; color: #1f2937; margin-bottom: 1rem; }}
        input {{ width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; }}
        button {{ width: 100%; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; }}
        button:disabled {{ opacity: 0.6; cursor: not-allowed; }}
        .message {{ margin-top: 1rem; padding: 0.5rem; border-radius: 4px; }}
        .success {{ color: #22c55e; background: #dcfce7; }}
        .error {{ color: #ef4444; background: #fee2e2; }}
    </style>
</head>
<body>
    <div class='box'>
        <h1>Reset Your Password</h1>
        <p style='color:#6b7280; margin-bottom: 1rem;'>Enter your new password below.</p>
        <form id='resetForm'>
            <input type=""hidden"" id=""email"" value=""{emailSafe}"" />
            <input type=""hidden"" id=""code"" value=""{codeSafe}"" />
            <input type='password' id='newPassword' placeholder='New password' required minlength='8' />
            <input type='password' id='confirmPassword' placeholder='Confirm password' required minlength='8' />
            <button type='submit' id='submitBtn'>Reset Password</button>
        </form>
        <div id='message'></div>
    </div>
    <script>
        const email = document.getElementById('email').value;
        const code = document.getElementById('code').value;
        document.getElementById('resetForm').addEventListener('submit', async (e) => {{
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const msgEl = document.getElementById('message');
            const btn = document.getElementById('submitBtn');
            if (newPassword !== confirmPassword) {{
                msgEl.className = 'message error';
                msgEl.textContent = 'Passwords do not match.';
                return;
            }}
            btn.disabled = true;
            try {{
                const res = await fetch('/api/auth/reset-password', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{ email, token: code, newPassword, confirmPassword }})
                }});
                const data = await res.json();
                if (data.success) {{
                    msgEl.className = 'message success';
                    msgEl.textContent = 'Password reset successfully! You can close this page and return to the app.';
                    document.getElementById('resetForm').style.display = 'none';
                }} else {{
                    msgEl.className = 'message error';
                    msgEl.textContent = data.message || (data.errors && data.errors[0]) || 'Reset failed.';
                }}
            }} catch (err) {{
                msgEl.className = 'message error';
                msgEl.textContent = 'Something went wrong. Please try again.';
            }}
            btn.disabled = false;
        }});
    </script>
</body>
</html>";
    }

    #endregion
}
