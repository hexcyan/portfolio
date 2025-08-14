import MyButton from "@/components/MyButton";
import styles from "@/app/blog.module.css";
import Image from "next/image";
export default function Home() {
    return (
        <>
            <div className={styles.splash}>
                <Image
                    src="https://pbs.twimg.com/profile_banners/1611038433098760199/1725894588/1500x500"
                    alt="profile banner"
                    width={1500}
                    height={500}
                />
            </div>
            <article className={styles.prose}>
                <h2>welcome to my digital corner</h2>
                <p>hi i like making websites</p>
                <p>but this one isn&apos;t done yet :grin:</p>
                <MyButton path="/blog" text="check out the blog ->" />
            </article>
        </>
    );
}
