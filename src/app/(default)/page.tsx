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
                <p>
                    did you know that when you die, you can&apos;t use your
                    computer anymore?
                </p>
                <p>
                    so while you&apos;re still alive, make sure to use the
                    computer as much as possible because one day you won&apos;t
                    be able to use it anymore!
                </p>
                {/* <p>hi i like making websites</p> */}
                {/* <p>but this one isn't done yet :grin:</p> */}
                <MyButton path="/blog" text="check out the blog ->" />
            </article>
        </>
    );
}
