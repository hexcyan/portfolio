import PopupWindow from "@/components/PopupWindow";
import MyButton from "@/components/MyButton";
import styles from "./page.module.css";
export default function Home() {
    return (
        <PopupWindow>
            <h3>404</h3>
            <p>This page could not be found.</p>
            <MyButton text="go back" path="/" />
        </PopupWindow>
    );
}
