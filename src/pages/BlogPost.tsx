import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { blogPosts } from "@/data/blogPosts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft, Share2, Heart } from "lucide-react";

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <span className="text-6xl mb-4 block">📄</span>
          <h1 className="text-2xl font-bold mb-4">Статья не найдена</h1>
          <Link to="/blog">
            <Button>Вернуться в блог</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад в блог
        </Link>

        <article className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
              {post.category}
            </Badge>
            <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString("ru-RU", { 
                  day: "numeric", 
                  month: "long",
                  year: "numeric"
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime} мин чтения
              </span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="aspect-video rounded-2xl overflow-hidden mb-8">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            {post.content.split('\n').map((paragraph, idx) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={idx} className="font-playfair text-2xl font-bold mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={idx} className="font-playfair text-xl font-semibold mt-6 mb-3">{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <p key={idx} className="font-semibold my-2">{paragraph.replace(/\*\*/g, '')}</p>;
              }
              if (paragraph.startsWith('- ')) {
                return <li key={idx} className="ml-4 my-1">{paragraph.replace('- ', '')}</li>;
              }
              if (paragraph.trim()) {
                return <p key={idx} className="text-muted-foreground my-4 leading-relaxed">{paragraph}</p>;
              }
              return null;
            })}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-sm">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Share */}
          <div className="flex items-center justify-between py-6 border-t border-b border-border mb-12">
            <span className="text-muted-foreground">Понравилась статья?</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Heart className="w-4 h-4" />
                Сохранить
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Поделиться
              </Button>
            </div>
          </div>

          {/* Author Box */}
          <div className="bg-secondary/30 rounded-2xl p-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                👩‍⚕️
              </div>
              <div>
                <h4 className="font-semibold">{post.author}</h4>
                <p className="text-sm text-muted-foreground">
                  Эксперт HonnyLove по уходу за кожей
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-5xl mx-auto">
            <h2 className="font-playfair text-2xl font-bold mb-6">
              Похожие статьи
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.id}`}
                  className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img 
                      src={relatedPost.image} 
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {relatedPost.readTime} мин чтения
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
