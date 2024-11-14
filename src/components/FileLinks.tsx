import Link from "next/link";
import { files } from "./consts";
import Image from "next/image";
export default function FileLinks() {
    return (
        <>
            {files.map((file) => {
                return (
                    <div key={file.title}>
                        {/* render icon based on file type */}
                        <Link href={file.route}>
                            <Image
                                src={`/assets/${file.type}.png`}
                                alt={file.title}
                                width={48}
                                height={48}
                            />
                            <h3>{file.title}</h3>
                        </Link>
                    </div>
                );
            })}
        </>
    );
}
