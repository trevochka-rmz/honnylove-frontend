import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useBlogPost, useBlogs, BlogPost as BlogPostType } from "@/hooks/useBlogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft, Share2, Loader2, ImageOff } from "lucide-react";
import { toast } from "sonner";

const BlogPost = () => {
  const { slug } = useParams();
  const { data: post, isLoading, error } = useBlogPost(slug || '');
  const { data: allPosts } = useBlogs({ limit: 10 });

  // Get related posts by category
  const relatedPosts = allPosts?.posts
    ?.filter(p => p.slug !== slug && p.category === post?.category)
    .slice(0, 3) || [];

  // Check if an image URL is valid
  const isValidImage = (url?: string) => {
    return url && url.trim() !== '' && !url.includes('undefined');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Загружаем статью...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
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
                {post.read_time} мин чтения
              </span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-secondary/30">
            {isValidImage(post.image) ? (
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const placeholder = document.createElement('div');
                  placeholder.className = 'w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary/50 to-rose-light/30';
                  placeholder.innerHTML = `
                    <div class="p-4 rounded-full bg-secondary/50 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/50"><line x1="2" x2="22" y1="2" y2="22"></line><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"></path><line x1="13.5" x2="6" y1="13.5" y2="21"></line><path d="m18 12 2 2 2-2"></path><path d="M21 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path></svg>
                    </div>
                    <span class="text-sm text-muted-foreground font-medium">Изображение скоро появится</span>
                    <span class="text-xs text-muted-foreground/70 mt-1">Мы работаем над этим ✨</span>
                  `;
                  (e.target as HTMLImageElement).parentElement?.appendChild(placeholder);
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary/50 to-rose-light/30">
                <div className="p-4 rounded-full bg-secondary/50 mb-3">
                  <ImageOff className="h-8 w-8 text-primary/50" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Изображение скоро появится</span>
                <span className="text-xs text-muted-foreground/70 mt-1">Мы работаем над этим ✨</span>
              </div>
            )}
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
              if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                return (
                  <li key={idx} className="ml-6 my-1">
                    {paragraph.replace(/^[-*] /, '')}
                  </li>
                );
              }
              if (paragraph.trim() === '') {
                return <br key={idx} />;
              }
              return <p key={idx} className="my-4 text-foreground/90 leading-relaxed">{paragraph}</p>;
            })}
          </div>

          {/* Tags with Share Button */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {post.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-muted-foreground">
                  #{tag}
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm"
                className="ml-auto gap-2 text-muted-foreground hover:text-primary"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Ссылка скопирована!");
                }}
              >
                <Share2 className="w-4 h-4" />
                Поделиться
              </Button>
            </div>
          )}

          {/* Author Box */}
          <div className="bg-card rounded-2xl p-6 border border-border mb-12">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="font-playfair font-semibold text-lg">{post.author}</h4>
                <p className="text-muted-foreground text-sm">
                  Эксперт по корейской косметике и уходу за кожей
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-4xl mx-auto">
            <h2 className="font-playfair text-2xl font-bold mb-6">Похожие статьи</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug || relatedPost.id}`}
                  className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all"
                >
                  <div className="aspect-video overflow-hidden bg-secondary/30">
                    {isValidImage(relatedPost.image) ? (
                      <img 
                        src={relatedPost.image} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary/50 to-rose-light/30">
                        <ImageOff className="h-6 w-6 text-primary/50 mb-1" />
                        <span className="text-xs text-muted-foreground">Скоро</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-playfair font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {relatedPost.read_time} мин чтения
                    </p>
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
