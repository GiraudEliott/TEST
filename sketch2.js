class Particle {
  constructor(sketch, maximum_distance, circle_color, line_color, min_radius = 5, max_radius = 15) {
    this.sketch = sketch

    this.max_speed    = 2
    this.maximum_distance = maximum_distance

    this.circle_color = circle_color || "#999999"
    this.line_color = line_color || "gray"

    this.min_radius = min_radius
    this.max_radius = max_radius

    this.reset()
  }

  reset() {
    this.radius   = this.sketch.random(this.min_radius, this.max_radius)
    this.position = this.sketch.createVector(this.sketch.random(this.sketch.width),this.sketch.random(this.sketch.height))
    this.velocity = this.sketch.createVector(this.sketch.random(this.max_speed * -1, this.max_speed),this.sketch.random(this.max_speed * -1, this.max_speed))
  }

  update() {
    this.position.add(this.velocity)
    this.edges()
  }

  // Bounce at the edges
  edges() {
    if (this.position.x <= 0 || this.position.x >= this.sketch.width) this.velocity.x *= -1
    if (this.position.y <= 0 || this.position.y >= this.sketch.height) this.velocity.y *= -1
  }

  draw() {
    this.sketch.push()

    this.sketch.fill(this.circle_color)
    this.sketch.stroke(this.circle_color)

    this.sketch.circle(this.position.x, this.position.y, this.radius)

    this.sketch.pop()
  }

  drawLinkToNearParticles(particles) {
    this.sketch.push()
    this.sketch.stroke(this.line_color)
    particles.forEach(particle => {
      if (this.sketch.dist(this.position.x, this.position.y, particle.position.x, particle.position.y) < this.maximum_distance) {
        this.sketch.line(this.position.x, this.position.y, particle.position.x, particle.position.y)
      }
    })
    this.sketch.pop()
  }
}

// Avoiding Global Mode: https://github.com/processing/p5.js/wiki/Global-and-instance-mode
const experiment = ( sketch ) => {
  //
  // Configuration
  //
  let container = document.getElementById('sketch-holder')
  let canvas_el

  let particle_number_range  = [10, 500]
  let maximum_distance_range = [10, 500]

  let maximum_distance = 100;
  let number_of_particles;
  let particles = [];

  // Color Schemes
  let color_scheme
  let color_sets = {
    black_white: {
      background: "black",
      label: "Black Background / Light Elements",
      circle: [
        'rgb(240, 240, 240)'
      ],
      line: [
        'rgb(200, 200, 200)'
      ],
      min_radius: 1,
      max_radius: 5
    },
    white_black: {
      background: "white",
      label: "White Background / Dark Elements",
      circle: [
        'rgb(40, 40, 40)'
      ],
      line: [
        'rgba(100, 100, 100, 0.8)'
      ],
      min_radius: 5,
      max_radius: 10
    },
    black_color: {
      background: "black",
      label: "Black Background / Colorful Elements",
      circle: [
        '#04E762',
        '#F5B700',
        '#00A1E4',
        '#DC0073',
        '#89FC00'
      ],
      line: [
        '#04E76288',
        '#F5B70088',
        '#00A1E488',
        '#DC007388',
        '#89FC0088'
      ],
      min_radius: 5,
      max_radius: 10
    },
    red_white: {
      background: "red",
      label: "Red Background / Large White Circles",
      circle: ["white"],
      line: ["white"],
      min_radius: 10,
      max_radius: 30
    }
  }

  // Controls
  let controls = {
    play_pause_toggle: document.getElementById("experiment-control-pause-toggle"),
    particle_count: document.getElementById("experiment-control-particle-count"),
    maximum_distance: document.getElementById("experiment-control-maximum-distance"),
    color_scheme_picker: document.getElementById("experiment-control-color-scheme"),
    fullscreen: document.getElementById("experiment-control-fullscreen-toggle"),
    save: document.getElementById("experiment-control-save")
  }

  let control_labels = {
    particle_count: document.getElementById("experiment-label-particle-counter"),
    maximum_distance: document.getElementById("experiment-label-maximum-distance"),
  }

  //
  // Control Handling
  //

  function setupControls() {
    controls.particle_count.min = particle_number_range[0]
    controls.particle_count.max = particle_number_range[1]

    control_labels.maximum_distance.innerHTML = maximum_distance
    controls.maximum_distance.min = maximum_distance_range[0]
    controls.maximum_distance.max = maximum_distance_range[1]

    Object.entries(color_sets).forEach(([key, scheme]) => {
      var option = document.createElement("option")
      option.value = key
      option.text = scheme.label
      if (key == color_scheme) option.selected = "SELECTED"

      controls.color_scheme_picker.add(option)
    })
  }

  function updateControls() {
    controls.particle_count.value = number_of_particles
    control_labels.particle_count.innerHTML = number_of_particles
  }

  function installControlHandlers() {
    //
    // Pause / Play
    //
    controls.play_pause_toggle.addEventListener("click", function() {
      this.querySelectorAll('i').forEach( (el) => {
        if (!el.classList.contains('hide')) { // Look for the active icon
          if (el.classList.contains('fa-pause-circle')) {
            sketch.noLoop()
          } else if (el.classList.contains('fa-play-circle')) {
            sketch.loop()
          }
        }

        el.classList.toggle('hide')
      })
    })

    //
    // Number of Particles slider
    //
    controls.particle_count.addEventListener("input", function(event) {
      control_labels.particle_count.innerHTML = event.target.value
    })
    controls.particle_count.addEventListener("change", function(event) {
      updateParticleCount(event.target.value)
    })

    //
    // Maximum Distance Slider
    //
    controls.maximum_distance.addEventListener("input", function(event) {
      control_labels.maximum_distance.innerHTML = event.target.value
    })
    controls.maximum_distance.addEventListener("change", function(event) {
      maximum_distance = parseInt(event.target.value)
      particles.forEach(particle => { particle.maximum_distance = maximum_distance })
    })

    //
    // Color Scheme
    //
    controls.color_scheme_picker.addEventListener("change", function(event) {
      color_scheme = event.target.value
      particles.forEach(particle => {
        particle.circle_color = sketch.random(color_sets[color_scheme].circle)
        particle.line_color   = sketch.random(color_sets[color_scheme].line)

        if (color_sets[color_scheme].min_radius && color_sets[color_scheme].max_radius) {
          particle.radius = sketch.random([color_sets[color_scheme].min_radius, color_sets[color_scheme].max_radius])
        }
      })

      if (!sketch.isLooping()) sketch.draw()  // Draw a frame for your witcher
    })

    // Save file
    controls.save.addEventListener("click", function() {
      sketch.save(canvas_el, `particle_effects_${color_scheme}_${number_of_particles}_${maximum_distance}_${Math.floor(Date.now() / 1000)}`, 'png')
    })

    // Fullscreen
    controls.fullscreen.addEventListener("click", function() {
      this.querySelectorAll('i').forEach( (el) => {
        if (!el.classList.contains('hide')) { // Look for the active icon
          if (el.classList.contains('fa-compress')) {
            sketch.fullscreen(false)
          } else {
            sketch.fullscreen(true)
          }
        }

        el.classList.toggle('hide')
      })
    })
  }

  //
  // P5.js touchpoints
  //
  sketch.setup = () => {
    canvas_el = sketch.createCanvas(container.clientWidth, container.clientHeight)
    canvas_el.parent(container)

    color_scheme = sketch.random(Object.keys(color_sets))

    updateParticleCount()
    setupControls()
    updateControls()
    installControlHandlers()
  }

  sketch.windowResized = () => {
    sketch.resizeCanvas(container.clientWidth, container.clientHeight)
    sketch.draw()
  }

  sketch.draw = () => {
    sketch.background(color_sets[color_scheme].background)

    particles.forEach((particle, index) => {
      particle.drawLinkToNearParticles(particles.slice(index))
      particle.draw()
      particle.update()
    })
  }

  //
  // Helper methods
  //

  function buildParticle() {
    return new Particle(
      sketch,
      maximum_distance,
      sketch.random(color_sets[color_scheme].circle),
      sketch.random(color_sets[color_scheme].line),
      color_sets[color_scheme].min_radius,
      color_sets[color_scheme].max_radius

    )
  }

  function updateParticleCount(value = null) {
    number_of_particles = parseInt(value) || Math.floor(container.clientWidth / 10)

    if (number_of_particles < particles.length) {
      particles.splice(number_of_particles)
    } else {
      for(var i = particles.length; i < number_of_particles; i++) {
        particles[i] = buildParticle()
      }
    }
  }
}


// Wait for everything to load
if (document.readyState === 'complete') {
  new p5(experiment)
} else {
  window.onload = (event) => {
    new p5(experiment)
  }
}