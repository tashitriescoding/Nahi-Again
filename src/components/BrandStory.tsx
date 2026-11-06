// EDIT THE TEXT BELOW: this is draft copy built from what's on your site.
// Replace it with Nahi's real story (the weave, the makers, the process).

const explainers = [
    {
      title: "What is HABI?",
      body: "HABI is our line of lightweight jackets, rooted in Philippine textile heritage. Add the story of the weave and the people who make it here.",
    },
    {
      title: "What is made-to-order?",
      body: "Every piece is crafted on demand, just for you. Nothing sits on a shelf, and each garment is made with care once you place your order.",
    },
  ];
  
  const reasons = [
    {
      title: "Made for you",
      body: "Bespoke, made-to-order pieces for every kind of person, whether bold or understated.",
    },
    {
      title: "Rooted in Philippine heritage",
      body: "Our designs draw on Philippine textile traditions and the craft behind them.",
    },
    {
      title: "Truly one of a kind",
      body: "Our 1-1 pieces are made once. When one is gone, it's gone.",
    },
  ];
  
  export default function BrandStory() {
    return (
      <section className="max-w-[1600px] mx-auto px-3 sm:px-6 md:px-12 lg:px-20 pb-16 sm:pb-24">
        {/* Explainer cards */}
        <div className="grid gap-3 sm:gap-6 md:grid-cols-2">
          {explainers.map((item) => (
            <div
              key={item.title}
              className="bg-[#F5F5F3] border border-black/5 p-6 sm:p-10"
            >
              <h3 className="font-serif text-xl sm:text-2xl tracking-wide">
                {item.title}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-black/60">
                {item.body}
              </p>
            </div>
          ))}
        </div>
  
        {/* Why Nahi */}
        <div className="text-center mt-16 sm:mt-24 mb-6 sm:mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-wide">
            Why Nahi
          </h2>
        </div>
  
        <div className="grid gap-3 sm:gap-6 md:grid-cols-3">
          {reasons.map((item) => (
            <div
              key={item.title}
              className="bg-[#F5F5F3] border border-black/5 p-6 sm:p-10 text-center"
            >
              <h3 className="font-serif text-lg sm:text-xl tracking-wide">
                {item.title}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-black/60">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }