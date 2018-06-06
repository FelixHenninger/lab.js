# -*- coding: utf-8 -*-
"""
    ReST directive for embedding Youtube and Vimeo videos.
    There are two directives added: ``youtube`` and ``vimeo``. The only
    argument is the video id of the video to include.
    Both directives have three optional arguments: ``height``, ``width``
    and ``align``. Default height is 281 and default width is 500.
    Example::
        .. youtube:: anwy2MPT5RE
            :height: 315
            :width: 560
            :align: left
    :copyright: (c) 2012 by Danilo Bargen.
    :license: BSD 3-clause
"""

# Adapted by Felix Henninger to fit the lab.js documentation.
# All bugs are his; notably, the manual adjustment of width
# and height are (deliberately) removed

from __future__ import absolute_import
from docutils import nodes
from docutils.parsers.rst import Directive, directives
import os, shutil

def align(argument):
    """Conversion function for the "align" option."""
    return directives.choice(argument, ('left', 'center', 'right'))

class IframeVideo(Directive):
    has_content = False
    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = False
    option_spec = {
        'height': directives.nonnegative_int,
        'width': directives.nonnegative_int,
        'align': align,
    }
    default_width = 500
    default_height = 281

    def run(self):
        self.options['video_id'] = directives.uri(self.arguments[0])
        if not self.options.get('width'):
            self.options['width'] = self.default_width
        if not self.options.get('height'):
            self.options['height'] = self.default_height
        if not self.options.get('align'):
            self.options['align'] = 'left'
        return [nodes.raw('', self.html % self.options, format='html')]

class RawVideo(Directive):
    has_content = False
    required_arguments = 1
    optional_arguments = 0
    final_argument_whitespace = False
    option_spec = {}

    html = \
      '''
        <div class="embed-container">
          <video controls src="{path}" style="width: 100%"></video>
        </div>
      '''

    def run(self):
        document = self.state.document
        env = document.settings.env
        raw_path = directives.uri(self.arguments[0])

        rel_filename, filename = env.relfn2path(raw_path)
        basename = os.path.basename(filename)
        dirname = os.path.dirname(filename)

        save_filename = os.path.join('_videos', basename)

        env.note_dependency(rel_filename)
        env.config.video_files.append({
            'source': rel_filename,
            'target': save_filename,
        })

        self.options['path'] = os.path.relpath(
            save_filename,
            os.path.dirname(env.docname)
        )

        # TODO: For some weird reason, the output folder
        # /_static/videos is created, and I can't figure
        # out why. Probably a case for a rainy afternoon

        return [nodes.raw('', self.html.format(**self.options), format='html')]

class Youtube(IframeVideo):
    html = \
      '''
        <div class="embed-container">
          <iframe
            src="https://www.youtube.com/embed/%(video_id)s"
            frameborder="0"
            allowfullscreen webkitAllowFullScreen mozallowfullscreen
            class="align-%(align)s">
          </iframe>
        </div>
      '''

class Vimeo(IframeVideo):
    html = \
      '''
        <div class="embed-container">
          <iframe src="https://player.vimeo.com/video/%(video_id)s"
            frameborder="0"
            webkitAllowFullScreen mozallowfullscreen allowFullScreen
            class="align-%(align)s">
          </iframe>
        </div>
      '''

def on_builder_init(app):
    app.config.video_files[:] = []

def on_html_collect_pages(app):
    try:
        os.makedirs(os.path.join(app.builder.outdir, '_videos'))
    except OSError:
        pass

    for f in app.config.video_files:
        src = os.path.join(app.srcdir, f['source'])
        target = os.path.join(app.builder.outdir, f['target'])
        if os.path.exists(src):
            shutil.copy(src, target)
    return []

def setup(app):
    directives.register_directive('youtube', Youtube)
    directives.register_directive('vimeo', Vimeo)

    directives.register_directive('video', RawVideo)
    app.add_config_value('video_files', [], 'html')

    app.connect('builder-inited', on_builder_init)
    app.connect('html-collect-pages', on_html_collect_pages)
