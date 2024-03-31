import Link from "next/link"
import Image from "next/image";
import { OrganizationSwitcher,SignOutButton, SignedIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

function Topbar() {
    return (
        <nav className="topbar">
            <Link href="/" className="flex items-center gap-4">
            <Image src='/assets/logo1.svg' alt='logo' width={84} height={84} className="rounded-full"/>
            </Link>
            <div className="flex items-center gap-1">
                <div className="block md:hidden">
                    <SignedIn>
                        <SignOutButton>
                            <div className="flex cursor-pointer">
                            <Image
                                src='/assets/logout.svg'
                                alt='logout'
                                width={24}
                                height={24}
                            />
                            </div>
                        </SignOutButton>
                    </SignedIn>
                </div>
                <Link href="/aboutus" className="text-sm text-slate-200 font-serif backdrop-blur">About</Link> 
                <p className='text-heading3-bold text-slate-200 max-xs:hidden font-serif backdrop-blur tracking-wide'>
                    Banyan Bonds
                </p>
                <OrganizationSwitcher
                    appearance={{
                        
                        elements: {
                        organizationSwitcherTrigger: "py-2 px-4 text-slate-900 bg-zinc-200 bg-opacity-70",
                        },
                }}
                />
            </div>
        </nav>
    );
}

export default Topbar;