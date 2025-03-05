import CiaoWorker from './ciao/build/bin/ciao-async.js'
//import CiaoWorker from '/ciao/ciaowasm/js/ciao-async.js'

const playgroundCfg_defaults = {
  title: "Prolog playground",
  with_header: true,
  with_github_stars: true,
  has_new_button: true,
  has_open_button: true,
  has_save_button: true,
  //
  has_load_button: true,
  has_run_tests_button: true,
  has_debug_button: false,
  has_doc_button: true,
  has_acheck_button: true,
  has_spec_button: true,
  //
  has_share_button: true,
  //
  has_layout_button: true,
  has_examples_button: true,
  window_layout: ['E','T'],
  //
  storage_key: 'code', // key for local storage of draft program
  //
  splash_dialog: true,
  splash_code: `\
% Write your Prolog code here, e.g.:

app([],X,X).
app([X|L1],L2,[X|L3]) :-
     app(L1,L2,L3).
`,
  example_list: [
    // TODO: replace by a pedagogical list of smaller Ciao/Prolog/CLP examples; move this collection somewhere else
    { k:'core/examples/general/bignums.pl', n:'bignums.pl' },
//    { k:'core/examples/general/boyer.pl', n:'boyer.pl' },
    { k:'core/examples/general/crypt.pl', n:'crypt.pl' },
    { k:'core/examples/general/derivf.pl', n:'derivf.pl' },
//    { k:'core/examples/general/fib.pl', n:'fib.pl' },
//    { k:'core/examples/general/fft.pl', n:'fft.pl' },
//    { k:'core/examples/general/guardians.pl', n:'guardians.pl' },
//    { k:'core/examples/general/jugs.pl', n:'jugs.pl' },
    { k:'core/examples/general/knights.pl', n:'knights.pl' },
    { k:'core/examples/general/money_clpfd.pl', n:'money_clpfd.pl' },
    { k:'core/examples/general/nqueens.pl', n:'nqueens.pl' },
    { k:'core/examples/general/nqueens_clpfd.pl', n:'nqueens_clpfd.pl' },
//    { k:'core/examples/general/poly.pl', n:'poly.pl' },
//    { k:'core/examples/general/population_query.pl', n:'population_query.pl' },
    { k:'core/examples/general/primes.pl', n:'primes.pl' },
    { k:'core/examples/general/qsort.pl', n:'qsort.pl' },
    { k:'core/examples/general/sudoku_clpfd.pl', n:'sudoku_clpfd.pl' }
//    { k:'core/examples/general/tak.pl', n:'tak.pl' }
  ],
  // Delay for saving when content changes (milliseconds)
  // (do not set too low if files are large)
  autosave_delay: 200,
  // Amend code (add module, etc.)
  amend_on_save: true,
  // Show statistics (and some logging info) per query (in the JS console)
  statistics: true,
  // Query timeout (seconds) (0 to disable)
  query_timeout: 10,
  // Auto-* actions (on start and restart)
  auto_action: 'load',
  // Do auto-* actions on the fly (as document changes)
  on_the_fly: false,
  // Special queries // TODO: missing arity
  special_query: {
    "use_module": { read_code: true, mark_errs: true },
    "run_tests_in_module": {
      read_code: true,
      mark_errs: true,
      depends: ['ciaodbg'],
      on_init: ["use_module(library(unittest))"]
    },
//    "clean_mods": {
//      on_init: ['use_module(ciaobld(ciaoc_batch_call), [clean_mods/1])']
//    },
    "doc_cmd": {
      read_code: true,
      mark_errs: true,
      depends: ['lpdoc'],
      on_init: ['use_module(lpdoc(docmaker))']
    },
    //
    "module": {
      read_code: true,
      mark_errs: true,
      depends: ['ciaopp','typeslib'],
      on_init: ["use_module(ciaopp(ciaopp))"]
    },
    "auto_analyze": { // arity {1,2}
      read_code: true,
      mark_errs: true,
      depends: ['ciaopp','typeslib'],
      on_init: ["use_module(ciaopp(ciaopp))"]
    },
    "auto_optimize": { // arity {1,2}
      read_code: true,
      mark_errs: true,
      depends: ['ciaopp','typeslib'],
      on_init: ["use_module(ciaopp(ciaopp))"]
    },
    "auto_check_assert": { // arity {1,2}
      read_code: true,
      mark_errs: true,
      depends: ['ciaopp','typeslib'],
      on_init: ["use_module(ciaopp(ciaopp))"]
    }
  },
  // Default bundles and initialization queries
  init_bundles: [
    'ciaowasm', // (for foreign-js)
    'core',
    'builder'
  ],
  init_queries: [
    'use_module(engine(internals), [reload_bundleregs/0])',
    'use_module(library(classic/classic_predicates))'
  ],
  // keep worker alive (only for inLPDOC at this moment)
  inLPDOC_keep_alive: true
};

if (typeof playgroundCfg === 'undefined') {
  var playgroundCfg = {};
}
playgroundCfg = Object.assign({...playgroundCfg_defaults}, playgroundCfg);

var QueryState = {
    READY: 0, // ready for a query
    RUNNING: 1, // query running
    VALIDATING: 2 // prompt waiting for validating solution
  };

export default class ToplevelProc {
    constructor() {
      this.w = null;
      this.comint = null; // associated comint ('null' to ignore)
      this.muted = false; // temporarily ignore comint // TODO: change comint instead?
      this.state = null;
      this.q_opts = {}; // running/validating query opts
      this.timer = undefined;
    }
  
    /* ---------------------------------------------------------------------- */
  
    /* Is the worker started? */
    is_started() {
      return (this.w !== null);
    }
  
    /* Start the worker (and load defaults, show prompt, load program) */
    async start() {
      //if (!this.muted) this.comint.set_log('Loading bundles and booting');
      // debugger;
      this.w = new CiaoWorker('/client/ciao/'); // create a Ciao worker
      await this.load_ciao_defaults();
      //this.w = new CiaoWorker('/src/ciao/'); // create a Ciao worker
      //console.log(w);
      //await this.load_ciao_defaults(); // TODO: check result?
      //if (!this.muted) this.comint.set_log(''); 
      //
      this.update_state(QueryState.READY);
      this.q_opts = {};
      //if (!this.muted) this.comint.display_status_new_prompt('silent');

      //await this.comint.pg.on_cproc_start();
    }
  
    /* Restart the worker */
    async restart() {
      this.shutdown();
      this.update_state(QueryState.READY);
      this.q_opts = {};
      const pmuted = this.set_muted(true); // TODO: mute on restart, make it optional?
      await this.start();
      this.muted = pmuted;
    }
  
    /* Terminate worker */
    shutdown() {
      if (!this.is_started()) return;
      this.w.terminate();
      this.w = null;
    }
  
    /* Make sure that worker is started */
    async ensure_started(comint) {
      if (this.is_started()) return;
      this.comint = comint; // attach to this comint
      await this.start();
    }
  
    // set muted and return previous value
    set_muted(v) {
      const prev = this.muted;
      this.muted = v;
      return prev;
    }
  
    /* ---------------------------------------------------------------------- */
  
    // Load the default bundles and modules
    async load_ciao_defaults() {
      // Use default bundles and show boot info (this starts the engine)
      for (const b of playgroundCfg.init_bundles) {
        await this.w.use_bundle(b);
      }
      // Boot and show system info
      {
        await this.w.bootInfo(); // TODO: check errors!
        let out = await this.w.read_stdout();
        let err = await this.w.read_stderr();
        //let info_match = out.match(/.*^(Ciao.*$).*/m);
        /*if (info_match != null && info_match.length == 2) {
          [...document.getElementsByClassName("lpdoc-footer")].forEach(node => {
            node.innerHTML = "Generated with LPdoc | <span style='color:var(--face-checked-assrt)'>RUNNING</span> " + info_match[1];
          });
        }*/
        if (playgroundCfg.statistics) console.log(out+err);
      }
      // Initialization queries on the toplevel
      for (const q of playgroundCfg.init_queries) {
        await this.muted_query_dumpout(q);
      }
      return true;
    }
  
    // Add (and execute) a new initialization query 
    /*async push_on_init(qs) {
      const started = this.is_started();
      for (const q of qs) {
        if (!playgroundCfg.init_queries.includes(q)) {
          playgroundCfg.init_queries.push(q);
          if (started) await this.muted_query_dumpout(q);
        }
      }
    }*/
  
    // Add (and execute) a new initialization query 
    /*async push_depends(bs) {
      let updated = false;
      const started = this.is_started();
      for (const b of bs) {
        if (!playgroundCfg.init_bundles.includes(b)) {
          playgroundCfg.init_bundles.push(b);
          if (started) await this.w.use_bundle(b); // load if already started
          updated = true;
        }
      }
      // if (started && updated) await this.restart(); // TODO: not needed now!
      if (started && updated) {
        await this.w.wait_no_deps(); //wait until there are no pending loading deps 
        await this.muted_query_dumpout('reload_bundleregs');
      }
    }*/
  
    /* ---------------------------------------------------------------------- */
  
    // Do a query, only one solution, dump stdout/stderr, 
    async muted_query_dumpout(q) {
      //if (playgroundCfg.statistics) console.log(`{implicit: ${q}}`);
      await this.w.query_one_begin(q);
      await this.dumpout(); // TODO: check errors!
      await this.w.query_end();
    }
  
    // Dump last query stdout/stderr (ignore or show in console)
    async dumpout() {
      let out = await this.w.read_stdout();
      let err = await this.w.read_stderr();
      //if (playgroundCfg.statistics) console.log(out+err);
    }
  
    /* ---------------------------------------------------------------------- */
  
    /*set_query_timeout() {
      if (playgroundCfg.query_timeout == 0) return; // no timeout 
      this.timer = setTimeout((async() => {
        if (!this.muted) this.comint.print_msg('\n{ABORTED: Time limit exceeded.}\n');
        await this.restart();
        if (!this.muted) this.comint.display_status_new_prompt('silent'); // amend prompt if needed 
      }), playgroundCfg.query_timeout * 1000); // set a timeout 
    }
    cancel_query_timeout() {
      if (this.timer !== undefined) {
        clearTimeout(this.timer);
        this.timer = undefined;
      }
    }*/
  
    /* ---------------------------------------------------------------------- */
  
    // TODO: only works for single goal queries; this needs to be done
    // at Prolog level with Prolog->JS communication
  
    async trans_query(query) {
      let treat_outerr = null;
      // debugger
      console.log('QUERY: ' + query);
      // apply transformation if needed
      /*if (playgroundCfg.custom_run_query !== undefined) {
        query = playgroundCfg.custom_run_query(query);
      }
      console.log('QUERY: ' + query);
      // perform special query actions
      let f_match = query.match(/([a-z][_a-zA-Z0-9]*)(?:\(|$)/); // functor name // TODO: arity is missing, do from Prolog
      if (f_match != null && f_match.length == 2) {
        const special_query = playgroundCfg.special_query[f_match[1]];
        console.log(special_query);
        if (special_query !== undefined) {
          if (special_query.depends !== undefined) { // new (bundle) dependencies
            await this.push_depends(special_query.depends);
          }
          if (special_query.on_init !== undefined) { // new initialization queries
            await this.push_on_init(special_query.on_init);
          }
          if (special_query.read_code === true) { // the query may read the code, upload to worker
            await this.comint.pg.upload_code_to_worker();
          }
          if (special_query.action !== undefined) { // replace auto_action
            playgroundCfg.auto_action = special_query.action;
          }
          if (special_query.mark_errs === true) { // the query may show messages on the code, treat outerr
            treat_outerr = async(out, err) => {
              this.comint.pg.mark_errs(out, err); // TODO: missing matching file?
            };
          }
        }
      }*/
      //
      return { q: query, treat_outerr: treat_outerr };
    }
  
    /* ---------------------------------------------------------------------- */
  
    update_state(state) {
      this.state = state;
      //this.comint.update_inner_layout(); // (query state changed)
    }
  
    check_not_running() { /* Alert if we are still running */
      if (this.state === QueryState.RUNNING) {
        alert('Already running a query');
        return false;
      }
      return true;
    }
    /*check_not_locked(comint) { // Alert if we are locked validating in another comint
      if (this.comint !== comint) {
        alert('Already validating a query');
        return false;
      }
      return true;
    }*/
  
    /**
     * Execute a new query on the toplevel (Pre: this.state === QueryState.READY)
     * @param {string} query - Query to be executed.
     */
    async run_query(comint, query, opts) {
      // debugger
      if (this.state !== QueryState.READY) {
        console.log('bug: already running or validating a query'); // TODO: treat_enter too fast?
        return; // TODO: query is lost!
      }
      //this.comint = comint; // attach to this comint
      // ----
      let tr = await this.trans_query(query);
      query = tr.q;
      // TODO: almost duplicated
      this.update_state(QueryState.RUNNING);
      this.q_opts = opts;
      // begin a new query
      //if (!this.muted && opts.msg !== undefined) this.comint.set_log(opts.msg); 
      //this.set_query_timeout();
      let q_out = await this.w.query_one_begin(query);
      //this.cancel_query_timeout();
      //if (!this.muted && opts.msg !== undefined) this.comint.set_log('');
      //
      await this.treat_sol(q_out, tr.treat_outerr); // print solution
      return q_out;
    }
  
    /**
     * Validate solution or execute new query on the toplevel (Pre: this.state === QueryState.VALIDATING).
     * @param {string} action - action (accept, fail to get new answer, etc.)
     */
    async validate_sol(comint, action) {
      // debugger
      //this.comint = comint; // attach to this comint
      if (this.state !== QueryState.VALIDATING) {
        console.log('bug: not in a validating solution state'); // TODO: treat_enter too fast?
        return; // TODO: action is lost!
      }
      if (action === '') { // accept solution, end query
        await this.w.query_end();
        this.update_state(QueryState.READY);
        this.q_opts = {};
        /*if (!this.muted)*/ this.comint.display_status_new_prompt('yes');
      } else {// ask for the next solution
        // TODO: almost duplicated
        this.update_state(QueryState.RUNNING);
        // next query solution
        //this.set_query_timeout();
        let q_out = await this.w.query_one_next();
        //this.cancel_query_timeout();
        //
        await this.treat_sol(q_out, null); // print solution
        console.log(q_out);
        return q_out;
      }
    }
  
    /**
     * If current query has a solution, print it and asks for more if
     * there are more solutions available. If it has no solutions, finish
     * the query.
     * @param {Object} q_out - Object containing an array with the solution of a query.
     */
  
    async treat_sol(q_out, treat_outerr) {
      // debugger
      /*if (playgroundCfg.statistics) {
        console.log('{Solved in ' + q_out.time + ' ms.}');
      }*/
      let out = await this.w.read_stdout();
      let err = await this.w.read_stderr();
      /* print stdout and stderr output */
      //if (!this.muted) this.comint.print_out(out+err);
      /* print solution */
      let solstatus;
      if (q_out.cont === 'failed') { // no more solutions
        solstatus = 'no';
      } else {
        // TODO: fixme, see toplevel.pl
        /* Pretty print query results (solutions or errors) */
        // (see ciaowasm.pl for possible cases)
        if (q_out.cont === 'success') {
          //if (this.comint.with_prompt) { /* only if itr, otherwise ignore bindings and cut */
            let prettysol = q_out.arg;
            if (prettysol === '') { // (no bindings, cut)
              solstatus = 'yes';
            } else {
              solstatus = '?'; // TODO: not always! detect when there are no choicepoints
              //if (!this.muted) this.comint.print_out('\n'+prettysol); // print output
              if (!this.muted) console.log('\n'+prettysol); // print output
            }
          //}
        } else if (q_out.cont === 'exception') { // TODO: horrible hack
          let ball = q_out.arg;
          //if (!this.muted) this.comint.print_msg('{ERROR: No handle found for thrown exception ' + ball + '}\n'); // print output
          if (!this.muted) console.log('{ERROR: No handle found for thrown exception ' + ball + '}\n'); // print output
          solstatus = 'aborted';
        } else if (q_out.cont === 'malformed') {
          solstatus = 'silent';
          //if (!this.muted) this.comint.print_msg('{SYNTAX ERROR: Malformed query}\n');
          if (!this.muted) console.log('{SYNTAX ERROR: Malformed query}\n');
        } else {
          solstatus = 'silent';
          console.log(`bug: unrecognized query result cont: ${q_out.cont} ${q_out.arg}`);
        }
      }
      const no_treat_outerr = this.q_opts.no_treat_outerr;
      if (solstatus === '?') {
        this.update_state(QueryState.VALIDATING);
        //if (!this.muted) this.comint.print_promptval();
      } else {
        await this.w.query_end();
        this.update_state(QueryState.READY);
        this.q_opts = {};
        //if (!this.muted) this.comint.display_status_new_prompt(solstatus);
        if (!this.muted) console.log(solstatus);
      }
      if (treat_outerr !== null) {
        if (no_treat_outerr !== true) {
          await treat_outerr(out, err);
        }
      } /*else if (!this.muted) {
        if (playgroundCfg.custom_postprint_sol !== undefined) {
          // custom postprint if needed
          await playgroundCfg.custom_postprint_sol(this.comint.pg);
        }
      }*/
      console.log('QUERY STATE in validate_sol: ' + this.state);
    }
  
    /* ---------------------------------------------------------------------- */
  
    /**
     * Abort the execution of the current query (if inside of `run_query(query)`).
     */
    async abort() {
      if (this.state === QueryState.RUNNING) {
        //.cancel_query_timeout();

        // print message
        // if (!this.muted) this.comint.print_msg('\n{ Execution aborted }\n'); // (same text as Ciao)
        
        //if (!this.muted) this.comint.print_msg('\n{ Execution aborted (resetting dynamic database) }\n'); // TODO: remove note when preserving the database is working
        // restart worker and update variables
        // TODO: just abort query, not the worker
        await this.restart();
        //if (!this.muted) this.comint.display_status_new_prompt('silent'); /* amend prompt if needed */
      }
    }
    async send_validation(text) {
      //const cproc = pg.cproc;
      if (this.state !== QueryState.VALIDATING) {
        console.log('bug: not validating a solution');
        return;
      }
      /*if (!cproc.check_not_locked(this)) return; // TODO: not possible?
      this.display(text);
      this.display('\n');
      this.reveal_end();*/
      let q_out = await this.validate_sol(null, text);
      return q_out;
    }
  }