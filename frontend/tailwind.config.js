/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 애니메이션 keyframes 정의
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        }
      },
      // 애니메이션 클래스 정의
      animation: {
        wiggle: 'wiggle 0.3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}