import MyButton from "@/components/MyButton";
import styles from "../blog.module.css";
import Image from "next/image";
export default function Home() {
    return (
        <>
            <article className={styles.prose}>
                <Image
                    src="https://pbs.twimg.com/profile_banners/1611038433098760199/1725894588/1500x500"
                    alt="profile banner"
                    width={1500}
                    height={500}
                />
                <h1>welcome to my digital corner</h1>
                <p>this is a collection of my work</p>
                <p>this site is still under construction</p>
                <p>enjoy :)</p>
                <MyButton path="/blog" text="check out the blog ->" />
            </article>
        </>
    );
}
