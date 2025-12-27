import { useEffect } from "react";
import { Link } from "react-router-dom"; // ✅ IMPORTANT
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import Footer from "../components/Footer";
import { FiMessageCircle } from "react-icons/fi";
import customer from "../customer/customer-service.png"

const categories = [
  { href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
  { href: "/t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
  { href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
  { href: "/glasses", name: "Glasses", imageUrl: "/glasses.png" },
  { href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
  { href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
  { href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
];

const HomePage = () => {
  const { fetchFeaturedProducts, products, isLoading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-center text-5xl sm:text-6xl font-bold mb-4">
          Explore Our Categories
        </h1>

        <p className="text-center text-xl text-gray-300 mb-12">
          Discover the latest trends in eco-friendly fashion
        </p>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>

        {/* Featured Products */}
        {!isLoading && products.length > 0 && (
          <FeaturedProducts featuredProducts={products} />
        )}
      </div>

      {/* ✅ Sticky Contact Button */}

<Link
  to="/contact"
  className="
    fixed bottom-6 right-6 z-50
    w-16 h-16
    flex items-center justify-center
    rounded-full
    bg-gradient-to-r from-white to-red-500
    shadow-lg shadow-emerald-500/40
    hover:scale-110 hover:shadow-xl
    transition-all duration-300
  "
>
  <img
    src={customer}
    alt="Support"
    className="w-8 h-8 text-white"
  />

  
  
</Link>


      <Footer />
    </div>
  );
};

export default HomePage;
