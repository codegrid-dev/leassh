export default function Stories() {
  return (
    <>
      <section className="sec sec-alt" id="stories">
        <div className="wrap">
          <div className="sec-head rv">
            <span className="eyebrow">Real weeks, real money</span>
            <h2>People who found the gap in their week</h2>
          </div>
          <div className="stories">
            <div className="story rv">
              <p className="story-q">&quot;I was walking my own two anyway. Now I take three more with me and it covers the weekly shop. Took me one evening to set up.&quot;</p>
              <div className="story-who">
                <div className="avatar" style={{background: 'linear-gradient(135deg,#7B2FF7,#B57CFF)'}}>AK</div>
                <div><b>Amara K.</b><span>Leeds · Dog walking</span></div>
                <span className="story-earn money">£210 a week</span>
              </div>
            </div>
            <div className="story rv">
              <p className="story-q">&quot;Two cat visits a day on my way to and from the office. It is fifteen minutes each and it pays for the car.&quot;</p>
              <div className="story-who">
                <div className="avatar" style={{background: 'linear-gradient(135deg,#00B87C,#5CE0B4)'}}>DM</div>
                <div><b>Danny M.</b><span>Bristol · Drop-in visits</span></div>
                <span className="story-earn money">£140 a week</span>
              </div>
            </div>
            <div className="story rv">
              <p className="story-q">&quot;I got my home boarding licence from the council, said so on the form, and had four enquiries in a fortnight. Retirement is a lot more fun with a spaniel in it.&quot;</p>
              <div className="story-who">
                <div className="avatar" style={{background: 'linear-gradient(135deg,#FFB020,#FF8A3D)'}}>JP</div>
                <div><b>Jean P.</b><span>Cardiff · Home boarding</span></div>
                <span className="story-earn money">£320 a week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BUSINESSES ============ */}
    </>
  );
}
