export default function AuthCodeErrorPage() {
  return (
    <div style={{ width: 740 }}>
      <div className="text-center text-3xl font-bold underline bg-red-500">認証エラー</div>
      <div className="flex flex-col justify-center items-center mt-3 gap-3">
        <p>メールリンクが無効か期限切れです。</p>
        <a href="/" className="underline">
          ログイン画面を表示
        </a>
      </div>
    </div>
  );
}
