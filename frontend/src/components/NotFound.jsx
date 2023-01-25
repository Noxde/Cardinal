import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="Gelion-Bold grid place-items-center h-screen">
      <div className="text-center">
        <h1 className="text-8xl">404</h1>
        <p className="Gelion-Semi-Bold">
          We couldn't find the page you're looking for.
        </p>
        <Link to="/" className="block btn px-5 mt-5">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
