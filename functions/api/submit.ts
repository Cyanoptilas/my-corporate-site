export async function onRequestPost({ request, env }) {
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

        const serviceDomain = env.MICROCMS_SERVICE_DOMAIN;
        const apiKey = env.MICROCMS_API_KEY;

        if (!serviceDomain || !apiKey) {
            console.error("Missing microCMS environment variables");
            return new Response(JSON.stringify({ error: "Server Configuration Error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const response = await fetch(`https://${serviceDomain}.microcms.io/api/v1/contacts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-MICROCMS-API-KEY": apiKey,
            },
            body: JSON.stringify({
                name,
                email,
                subject,
                message,
            }),
        });

        if (!response.ok) {
            console.error("microCMS API Error:", await response.text());
            throw new Error("Failed to post to microCMS");
        }

        console.log(`Successfully saved message from ${name} (${email}) to microCMS.`);

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
