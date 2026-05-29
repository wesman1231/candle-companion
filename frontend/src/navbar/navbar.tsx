export default function Navbar() {
  return (
    <nav className="w-full overflow-x-hidden">
      <ul className="flex justify-evenly w-full font-poppins bg-gray-200 divide-x divide-black ">
        <li className="px-6 text-center">Find Candles</li>
        <li className="px-6 text-center">Your Candles</li>
        <li className="px-6 text-center">About Us</li>
        <li className="px-6 text-center">Log In</li>
      </ul>
    </nav>
  );
}