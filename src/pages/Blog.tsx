import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { blogPosts } from "@/data/blogPosts";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";

const categories = ["Все", "Уход за кожей", "Тренды", "Домашняя одежда", "Ингредиенты", "Сезонный уход", "Лайфстайл"];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("Все");

  const filteredPosts = selectedCategory === "Все" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
            Блог HonnyLove
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Советы по уходу за кожей, тренды красоты, обзоры продуктов и секреты здорового сна
          </p>
        </div>

        {/* Featured Post */}
        <Link 
          to={`/blog/${featuredPost.id}`}
          className="block mb-12 group"
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/20 to-accent/20">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-[4/3] md:aspect-auto">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-primary/20 text-primary hover:bg-primary/30">
                  {featuredPost.category}
                </Badge>
                <h2 className="font-playfair text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime} мин
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <Badge variant="secondary" className="mb-3">
                  {post.category}
                </Badge>
                <h3 className="font-playfair text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString("ru-RU", { 
                      day: "numeric", 
                      month: "short" 
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime} мин чтения
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">📝</span>
            <h3 className="text-xl font-semibold mb-2">Статей не найдено</h3>
            <p className="text-muted-foreground">
              В этой категории пока нет статей
            </p>
          </div>
        )}

        {/* Newsletter */}
        <section className="mt-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold mb-4">
            Подпишитесь на рассылку
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Получайте новые статьи, эксклюзивные скидки и советы по уходу за собой
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Ваш email"
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
              Подписаться
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
