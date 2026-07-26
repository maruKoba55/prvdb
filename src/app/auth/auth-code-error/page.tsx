export default function AuthCodeErrorPage() {
  return (
    <div style={{ width: 740 }}>
      <div className="text-center text-3xl font-bold underline bg-red-500">認証エラー</div>
      <div className="flex flex-col justify-center">
        <div className="flex mt-3 ml-4">パスワード再設定メールのリンクが無効あるいは期限切れです。</div>
        <div className="flex mt-2 ml-6">以下の点をご確認ください。</div>
        <div className="flex ml-8">・メール送信元と、再設定画面を開いたブラウザは同一か？</div>
        <div className="flex ml-8">・セキュリティ対策アプリ等がメールのリンクを先読みしていないか？</div>
        <div className="flex justify-center mt-4 underline">
          <a href="/">ログイン画面を表示</a>
        </div>
      </div>
    </div>
  );
}
