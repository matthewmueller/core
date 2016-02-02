
0.7.3 / 2016-02-01
==================

  * fix assemble event names

0.7.2 / 2016-01-27
==================

  * add timer for assemble

0.7.1 / 2016-01-24
==================

  * need to update the tree instance in the build object

0.7.0 / 2016-01-24
==================

  * big internal refactor (see 5f974a283a819906e882d9ac8cf4829792be7f74)

0.6.2 / 2016-01-18
==================

  * create a seperate debug channel for timing

0.6.1 / 2016-01-17
==================

  * cleaning up timing logs

0.6.0 / 2016-01-17
==================

  * adding some internal time tracking

0.5.1 / 2015-12-29
==================

  * changing events naming convention and emitting hook events

0.5.0 / 2015-12-22
==================

  * emitting events on the core builder to allow logging

0.4.3 / 2015-12-15
==================

  * always allowing the preread check to happen, so modifying files between builds will trigger rebuilds

0.4.2 / 2015-12-14
==================

  * removing superfluous debug line

0.4.1 / 2015-12-13
==================

  * adding comments and cleaning up debug output

0.4.0 / 2015-12-07
==================

  * analyze: process deeply-nested deps that are marked dirty
  * deps: updating mako-tree

0.3.2 / 2015-12-03
==================

  * resetting the analyzing flag when an error is thrown by a hook

0.3.1 / 2015-12-01
==================

  * handling transpiled files with changing types more elegantly

0.3.0 / 2015-12-01
==================

  * meta: updating dependencies

0.2.1 / 2015-11-06
==================

  * meta: cleanup

0.2.0 / 2015-10-29
==================

  * updating tree, adding better parallelization
  * making hook setters chainable
  * allow running repeated analyze calls, in either parallel or serial
  * removing internal extensions management

0.1.0 / 2015-10-25
==================

  * bump mako-tree
  * no longer throwing errors for unrecognized file types

0.0.4 / 2015-10-22
==================

  * spending more time in the build phase, adding pre/post dependencies hooks, updating docs

0.0.3 / 2015-10-19
==================

  * ensuring hooks can be set for multiple types

0.0.2 / 2015-10-19
==================

  * bump mako-tree

0.0.1 / 2015-10-18
==================

:sparkles:
