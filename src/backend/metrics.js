import graphite from 'graphite';

const Metrics = {
  /**
   * @param {string} hostname The graphite ingestion point
   * @param {string} prefix The prefix to the base path of the metrics
   * @param {string} service The service name of the metric
   * @param {string} instance The service instance of the metric
   * @param {number} batchSize The maximum size of the metrics batch
   */
  Setup(hostname, prefix = 'test', service = 'general', instance = 'single', batchSize = 500) {
    // Cannot setup metrics if we don't have a place to push the metrics
    if (hostname == null || hostname == '') {
      console.log('Metrics collection disabled; nowhere to send metrics.');
      this.Push = time => {};
      this.IntervalFlush = () => {};
      return;
    }

    // Setup all the things
    this._client = graphite.createClient(`plaintext://${hostname}:2003/`);
    this._metrics = [];
    this._metricsBasePath = `${prefix}${prefix != null && prefix != '' ? '.' : ''}services.ews.${service}`;
    this._metricInstance = instance;
    this._metricsBatchSize = batchSize;
    console.log(`Sending metrics to ${hostname}; batches of ${this._metricsBatchSize}; prefixed with ${this._metricsBasePath}; instance ${this._metricInstance}`);
  },

  /**
   * Store a metric
   * @param {number} time The response time metric
   */
  Push(time) {
    this._metrics.push(time);
  },

  /**
   * Flush metrics every minute
   */
  IntervalFlush() {
    const interval = 60000;
    setInterval(() => {
      // Flush all metrics
      while (this._hasMetrics()) {
        // Pull out a batch of metrics
        const localMetrics = [];
        while (this._hasMetrics() && localMetrics.length < this._metricsBatchSize) {
          localMetrics.push(this._nextMetric());
        }

        // Calculate average response time
        const averageTime =
          localMetrics.reduce((prev, current) => {
            return prev + current;
          }, 0) / localMetrics.length;

        // Generate writable metrics
        const m = {};
        m[`${this._metricsBasePath}.responsetime.${this._metricInstance}`] = averageTime;
        m[`${this._metricsBasePath}.requests.${this._metricInstance}`] = localMetrics.length;

        // Send them out into the world
        this._client.write(m, function(err) {
          if (err == null) {
            return;
          }

          console.log('Failed to write metrics, boo.', m);
        });
      }
    }, interval);
  },

  _hasMetrics() {
    return this._metrics != null && this._metrics.length - this._metricsOffset > 0;
  },

  _nextMetric() {
    if (!this._hasMetrics()) {
      return null;
    }

    var metric = this._metrics[this._metricsOffset];
    this._metricsOffset += 1;

    if (this._metricsOffset * 2 >= this._metrics.length) {
      this._metrics = this._metrics.slice(this._metricsOffset);
      this._metricsOffset = 0;
    }

    return metric;
  },

  _client: null,
  _metrics: null,
  _metricsOffset: 0,
  _metricsBasePath: '',
  _metricInstance: '',
  _metricsBatchSize: 0
};

export default Metrics;
