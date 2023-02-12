function Loading() {
  return (
    <div className="wrapper">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <svg
          width="100px"
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          viewBox="225.92 241.42 151.08 119.68"
        >
          <metadata>
            Created by potrace 1.16, written by Peter Selinger 2001-2019
          </metadata>
          <g
            transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)"
            fill="#0d162a"
            stroke="none"
          >
            <path d="M2318 3581 c-27 -4 -52 -11 -58 -17 -10 -10 71 -92 435 -447 l110 -107 -52 -98 c-95 -179 -159 -381 -151 -482 l3 -41 51 26 c59 29 168 138 209 208 l28 48 -22 15 c-23 17 -28 56 -8 72 6 5 44 12 82 14 129 8 233 75 363 235 138 170 207 220 344 248 115 24 118 25 118 40 0 11 -12 15 -42 16 -24 0 -92 1 -153 2 l-110 2 -48 37 c-87 68 -144 71 -243 13 l-46 -27 36 -37 c20 -20 36 -47 36 -58 0 -21 -33 -53 -54 -53 -5 0 -82 71 -170 159 -137 135 -169 161 -216 178 -117 44 -336 70 -442 54z"></path>
          </g>
        </svg>
        <div className="spinner">
          <div className="bounce1"></div>
          <div className="bounce2"></div>
          <div className="bounce3"></div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
