import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { userIcons, sidebarIcons } from "@/components/icons";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const ProfileMenu = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  console.log(`session = `);
  console.log(session);

  // Giriş yapılmamışsa auth sayfasına yönlendir
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status]);

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition"
      >
        <div
          className="w-9 h-9 flex items-center justify-center rounded-full text-white font-bold"
          style={{ backgroundColor: "#85e09f" }}
        >
          {session?.user?.name.slice(0, 2)}
        </div>
        <FontAwesomeIcon
          icon={open ? sidebarIcons.collapse : sidebarIcons.expand}
          className="w-4 h-4 text-gray-500 transition-transform"
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-1 w-30 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <h6 
            className="flex items-center justify-center rounded-md 
            bg-white px-2 my-1 text-sm font-semibold text-gray-700"
          >
            {session?.user?.name}
          </h6>
          <div className="border-t border-gray-200"></div>
          <Link
            className="flex items-center rounded-md 
            border border-gray-300 bg-white gap-2 px-2 
            py-2 text-sm text-gray-700 shadow-sm 
            hover:bg-gray-100"
            href="/profile"
            onClick={() => setOpen(!open)}
          >
            <FontAwesomeIcon icon={userIcons.settings} className="w-4 h-4" />
            Account
          </Link>

          <span
            className="flex items-center rounded-md 
            border border-gray-300 bg-white gap-2 px-2 
            py-2 text-sm text-red-600 shadow-sm 
            hover:bg-gray-100"
          >
            <FontAwesomeIcon 
                icon={userIcons.logout} 
                className="w-4 h-4" 
            />
            <button
              className="inline-block"
              onClick={() => signOut({ callbackUrl: "/auth" })}
            >
              Logout
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
