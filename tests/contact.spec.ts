import { test, expect } from '@playwright/test';

test.describe('お問い合わせフォームの動作保証', () => {

    test('必須項目をすべて入力し、送信が成功すること', async ({ page }) => {
        // 1. お問い合わせページにアクセス
        await page.goto('/contact');

        // 2. HTTPリクエストのモック（傍受）
        // 実際にmicroCMSに毎回テストデータが送信されてしまうのを防ぐため、
        // /api/submit へのPOSTリクエストを検知したら、偽の「成功レスポンス」を返すように設定。
        await page.route('/api/submit', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: "Form submitted successfully" })
            });
        });

        // 3. フォームにテストデータを入力する
        await page.getByLabel('Name').fill('テスト太郎');
        await page.getByLabel('Email Address').fill('test-playwright@example.com');
        await page.getByLabel('Subject').fill('Playwright自動テストからの送信');
        await page.getByLabel('Message').fill('これは動作確認のためのテストメッセージです。');

        // 4. 送信ボタンを取得
        const submitButton = page.getByRole('button', { name: /Send Message/i });

        // 5. 送信ボタンをクリック
        await submitButton.click();

        // 6. 送信直後にボタンが「Sending...」に変わることを確認（ユーザーへのフィードバック機構）
        await expect(submitButton).toHaveText('Sending...');

        // 7. 送信完了メッセージが表示されるのを待機・確認
        const statusMessage = page.locator('#form-status');
        await expect(statusMessage).toBeVisible();
        await expect(statusMessage).toHaveText('Message sent successfully!');

        // 8. 正しくサクセスクラス（緑色表示）が付与されているか確認
        await expect(statusMessage).toHaveClass(/text-green-600/);

        // 9. フォームの中身が空（リセット）になっているか確認
        await expect(page.getByLabel('Name')).toBeEmpty();
        await expect(page.getByLabel('Message')).toBeEmpty();
    });

});
