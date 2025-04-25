import Image from "next/image";

interface UserAvatarProps {
  name: string;
  profileURL?: string;
  size?: number;
}

const UserAvatar = ({ name, profileURL, size = 120 }: UserAvatarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (profileURL) {
    return (
      <Image
        src={profileURL}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="rounded-full bg-primary-200 flex items-center justify-center text-dark-100 font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials(name)}
    </div>
  );
};

export default UserAvatar;
