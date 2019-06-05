+++
title = "Performance"
weight = 2
+++

{% trapezoid(background="#007bff") %}
<div class="container text-light">
  <div class="row mt-5 mb-4">
    <div class="col-lg order-lg-12 text-center text-lg-right">
      <i
        class="fas fa-stopwatch fa-fw fa-10x"
        style="transform: rotate(-15deg)"
      ></i>
    </div>
    <div class="col-lg order-lg-1 mt-5 mt-lg-0 text-center text-lg-left">
      <h1>Timing performance</h1>
      <p class="lead">
        For many research areas, timing of both stimulus presentation and response latencies is vital.
      </p>
      <p class="lead">
        <code>lab.js</code> aims to offer the best possible performance with regard to both.
      </p>
    </div>
  </div>
</div>
{% end %}

{% container(class="my-5") %}
<p class="lead">
  As experimentalists, precise timing is important to us. Therefore, we conduct extensive timing validation studies, following the procedure described in <a href="../publications">our paper</a>.
</p>

----

<div class="row py-4">
  <div class="col-lg-4">
    <h3 class="mb-3">Presentation timing</h3>
    <p>On modern browsers, <code>lab.js</code> consistently meets presentation times across browsers and operating systems.</p>
    <p>As the figure <span class="d-none d-lg-inline">to the right</span><span class="d-lg-none">below</span> shows, a wide range of presentation times are overwhelmingly met in our tests with external measurement equipment. Chrome in particular showed excellent presentation timing performance across operating systems. Deviations, if they occured, were largely limited to a single frame (shown in orange).</p>
  </div>
  <div class="col-lg-8">
    <img src="display.svg" class="w-100">
  </div>
</div>

<div class="row py-4">
  <div class="col-lg-4">
    <h3 class="mb-3">Response time measurement</h3>
    <p>As a general observation, recorded response times in <code>lab.js</code> overestimate response latencies by one frame (16.66 milliseconds), with very little measurement noise.</p>
    <p>The degree of overestimation depends on the operating system and browser involved. In particular, Chrome on Windows appears to be consistently spot-on with recorded reponse times.</p>
  </div>
  <div class="col-lg-8">
    <img src="responses.svg" class="w-100">
  </div>
</div>
{% end %}
