export async function onRequestPost({ request }) {
    try {
        const formData = await request.formData();
        const name = formData.get("name");
        const email = formData.get("email");
        const subject = formData.get("subject");
        const message = formData.get("message");

        // Validation (Basic)
        if (!name || !email || !subject || !message) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // TODO: Integrate with Email Service (e.g., SendGrid, Mailgun)
        // const response = await fetch('https://api.sendgrid.com/v3/mail/send', { ... })
        // OR save to a database (D1, KV, Supabase)

        console.log(`Received message from ${name} (${email}): ${subject}`);

        return new Response(
            JSON.stringify({ message: "Form submitted successfully" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (err) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
