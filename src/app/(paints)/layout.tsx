import { checkCDNHealth } from "@/lib/cdn-data";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isLive = await checkCDNHealth();

    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0 }}>
                {!isLive && (
                    <div style={{
                        background: "#fff3cd",
                        color: "#664d03",
                        borderBottom: "2px solid #ffca2c",
                        padding: "10px 16px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        textAlign: "center",
                        position: "sticky",
                        top: 0,
                        zIndex: 1000,
                        width: "100%",
                    }}>
                        Live data source is offline — stock levels shown may not be current.
                    </div>
                )}
                {children}
            </body>
        </html>
    );
}
