import PopupWindow from "@/components/PopupWindow";
import MyButton from "@/components/MyButton";

export default function Home() {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <PopupWindow>
                <h3>404 - Page Not Found</h3>
                <p>The page you are looking for does not exist.</p>
                <MyButton text="go back" path="/" />
            </PopupWindow>
        </div>
    );
}
