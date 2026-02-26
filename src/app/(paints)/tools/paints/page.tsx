import PaintsGallery from "@/components/Paints/PaintsGallery";
import "./paintsPage.css";

export const metadata = {
    title: "Holbein WC Viewer",
    description: "search and filter holbein watercolor paints",
};

export default function Paints() {
    return (
        <div className="paints-page">
            <header>
                <div className="paints__subtitle">
                    <h3>ホルベイン透明水彩絵具</h3>
                    <h3>
                        Holbein Couleurs à l&apos;aquarelle pour l&apos;Artists
                    </h3>
                </div>
                <h1>HOLBEIN ARTISTS&apos; WATERCOLOR™</h1>
            </header>
            <main>
                <PaintsGallery />
            </main>
        </div>
    );
}
