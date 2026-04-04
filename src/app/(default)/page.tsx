import MyButton from "@/components/MyButton";
import styles from "@/app/blog.module.css";
import Image from "next/image";
import { getSiteStatus } from "@/lib/site-metadata";

// ISR: serve static, revalidate in background every hour
export const revalidate = 3600;

export default async function Home() {
    const { lines } = await getSiteStatus();

    return (
        <>
            <div className={styles.splash}>
                <Image
                    src="https://pbs.twimg.com/profile_banners/1611038433098760199/1725894588/1500x500"
                    alt="profile banner"
                    width={1500}
                    height={500}
                    loading="eager"
                />
            </div>
            <article className={styles.prose}>
                {lines.length > 0 ? (
                    lines.map((line, i) => <p key={i}>{line}</p>)
                ) : (
                    <>
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
                    </>
                )}
                <MyButton path="/blog" text="check out the blog ->" />
            </article>
        </>
    );
}
