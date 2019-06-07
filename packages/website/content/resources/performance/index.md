+++
title = "Performance"
weight = 2
aliases = ['/performance']
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
  <div class="col-lg-8 text-center text-lg-right">
    <img src="display.svg" class="w-100">
    <small class="text-muted d-block ml-lg-5 float-lg-right">Timing validation results for stimulus presentation, in percent of target frames hit across simulated durations, browsers, and systems. The green areas represent the proportion of exact matches, orange areas are one frame to early or to late, and red areas two frames or more (only the case for Internet Explorer Edge, in less than 1% of the two longest presentation intervals).</small>
  </div>
</div>

<div class="row py-4">
  <div class="col-lg-4">
    <h3 class="mb-3">Response time measurement</h3>
    <p>Most browsers consistently overestimate response latencies by between one and two frames (16.7 to 33.4ms), with fairly little noise (the maximum standard deviation we observed was 7.4ms, in Internet Explorer Edge at 1000ms response latency).</p>
    <p>Chrome stands out not only for its small measurement variability across operating systems, but also for its consistent lag of almost exactly a frame on Linux and Mac OS, and around 1.5ms on Windows.</p>
  </div>
  <div class="col-lg-8 text-center text-lg-right">
    <img src="responses.svg" class="w-100">
    <small class="text-muted d-block ml-lg-5 float-lg-right">Timing validation results for response time measurement across browsers and systems. Dots represent the mean difference between simulated and captured response times in frames (16.7ms), and bars the observed standard deviation.</small>
  </div>
</div>
{% end %}
