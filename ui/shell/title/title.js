App.StonehearthTitleScreenView = App.View.extend(Ember.TargetActionSupport, {
   templateName: 'stonehearthTitleScreen',
   i18nNamespace: 'stonehearth',
   components: {},

   init: function() {
      this._super();
   },

   didInsertElement: function() {
      var self = this;

      radiant.call('radiant:client_about_info')
         .done(function(o) {
            self.set('productName', o.product_name + ' ' + o.product_version_string + ' (' + o.product_branch + ' ' +  o.product_build_number + ') ' + o.architecture + ' build');
            self._populateAboutDetails(o);
         });

      $.get('/stonehearth/release_notes/release_notes.html')
         .done(function(result) {
            self.set('releaseNotes', result);
         })

      // show the load game button if there are saves
      radiant.call("radiant:client:get_save_games")
         .done(function(json) {
            var vals = [];

            $.each(json, function(k ,v) {
               if(k != "__self" && json.hasOwnProperty(k)) {
                  v['key'] = k;
                  vals.push(v);
               }
            });

            // sort by creation time
            vals.sort(function(a, b){
               var tsA = a.gameinfo.timestamp ? a.gameinfo.timestamp : 0;
               var tsB = b.gameinfo.timestamp ? b.gameinfo.timestamp : 0;
               // sort most recent games first
               return tsB - tsA;
            });

            if (vals.length > 0) {
               var save = vals[0];
               var version = save.gameinfo.save_version;
               if (!version) {
                  version = 0;
               }
               if (version < App.minSupportedSaveVersion || version > App.currentSaveVersion) {
                  save.gameinfo.differentVersions = true;
                  $('#continueGameButton').tooltipster();
               }

               var gameDate = save.gameinfo.game_date;
               if (gameDate) {
                  var dateObj = new Date(0, 0, 0, gameDate.hour, gameDate.minute);
                  var localizedTime = dateObj.toLocaleTimeString(i18n.lng(), {hour: '2-digit', minute:'2-digit'});
                  gameDate.time = localizedTime;
               }

               self.$('#continue').show();
               self.$('#continueGameButton').show();
               self.$('#loadGameButton').show();

               self.set('lastSave', save);

               /*
               var ss = vals[0].screenshot;
               $('#titlescreen').css({
                     background: 'url(' + ss + ')'
                  });
               */
            }
            self._loadInProgressUiConfig();
         });

      // load the about info
      $('#about').click(function(e) {
         self.$('#blog').toggle();
      });

      // input handlers
      $(document).keyup(function(e) {
         $('#titlescreen').show();
      });

      $(document).click(function(e) {
         $('#titlescreen').show();
         self._showAlphaScreen();
         self._showModConflictScreen();
      });

      $('#radiant').fadeIn(800);

      setTimeout(function() {
         $('#titlescreen').fadeIn(800, function() {
            self._showAlphaScreen();
            self._showModConflictScreen();
         });
      }, 3000)
   },

   _loadInProgressUiConfig: function() {
      radiant.call('radiant:get_config', 'show_in_progress_ui')
         .done(function(response) {
            if (response.show_in_progress_ui) {
               self.$('#quickStartButton').show();
            } else {
               var lastVisibleButton;

               if (self.$('#loadGameButton').css('display') != 'none') {
                  lastVisibleButton = self.$('#loadGameButton');
               } else {
                  lastVisibleButton = self.$('#newGameButton');
               }

               lastVisibleButton.addClass('last');
            }
         });
   },

   _showAlphaScreen: function() {
      if (this._alphaScreenShown) {
         return;
      }

      this._alphaScreenShown = true;
      radiant.call('radiant:get_config', 'alpha_welcome')
         .done(function(o) {
            if (!o.alpha_welcome || !o.alpha_welcome.hide2) {
               App.shellView.addView(App.StonehearthConfirmView,
                  {
                     title : i18n.t('stonehearth:ui.shell.title_screen.alpha_welcome_dialog.title'),
                     message : i18n.t('stonehearth:ui.shell.title_screen.alpha_welcome_dialog.message'),
                     buttons : [
                        {
                           label: i18n.t('stonehearth:ui.shell.title_screen.alpha_welcome_dialog.accept'),
                           click: function () {
                              radiant.call('radiant:set_collection_status', true)
                              radiant.call('radiant:set_config', 'alpha_welcome', { hide2: true});
                           }
                        },
                        {
                           label: i18n.t('stonehearth:ui.shell.title_screen.alpha_welcome_dialog.cancel'),
                           click: function () {
                              radiant.call('radiant:set_collection_status', false)
                              radiant.call('radiant:set_config', 'alpha_welcome', { hide2: true});
                           }
                        }
                     ]
                  });
            }
         })

   },

   _showModConflictScreen: function() {
      var self = this;
      if (self._modConflictScreenShown) {
         return;
      }

      self._modConflictScreenShown = true;
      radiant.call('radiant:client_about_info')
         .done(function(o) {
            if (o.mod_conflicts && o.mod_conflicts.length > 0) {
               var message = i18n.t('stonehearth:ui.shell.title_screen.mod_conflic_dialog.message');
               for (var i=0; i < o.mod_conflicts.length; ++i) {
                  message = message + '<br>' + o.mod_conflicts[i];
               }
               App.shellView.addView(App.StonehearthConfirmView,
                  {
                     title : i18n.t('stonehearth:ui.shell.title_screen.mod_conflic_dialog.title'),
                     message : message,
                     buttons : [
                        {
                           label: i18n.t('stonehearth:ui.shell.title_screen.mod_conflic_dialog.accept')
                        }
                     ]
                  });
            }
         });
   },

   actions: {
      newGame: function() {
         radiant.call('radiant:play_sound', {'track' : 'stonehearth:sounds:ui:start_menu:embark'} );

         App.shellView.addView(App.StonehearthSelectGameStoryView, {});
         App.shellView.getView(App.StonehearthTitleScreenView).$().hide();
      },

      continueGame: function() {
         //XXX, need to handle validation in an ember-friendly way. No jquery
         if (this.$('#continueGameButton').hasClass('disabled')) {
            return;
         }

         var key = String(this.get('lastSave').key);

         // throw up a loading screen. when the game is loaded the browser is refreshed,
         // so we don't need to worry about removing the loading screen, ever.
         radiant.call("radiant:client:load_game", key);
         // At this point, we just wait to be killed by the client.
      },

      loadGame: function() {
         this.triggerAction({
            action:'openModal',
            actionContext: ['save',
               {
                  allowSaves: false,
               }
            ]
         });
      },

      // xxx, holy cow refactor this together with the usual flow
      quickStart: function() {
         var self = this;
         var MAX_INT32 = 2147483647;
         var seed = Math.floor(Math.random() * (MAX_INT32+1));

         var width = 12;
         var height = 8;
         this.$().hide();

         radiant.call('radiant:play_sound', {'track' : 'stonehearth:sounds:ui:start_menu:embark'} );
         App.shellView.addView(App.StonehearthLoadingScreenView);

         radiant.call('radiant:get_config', 'mods.stonehearth.world_generation.default_biome')
            .done(function(e) {
               var biome = e['mods.stonehearth.world_generation.default_biome'];
               if (!biome) {
                  biome = 'stonehearth:biome:temperate';
               }
               var options = {
                  game_mode : 'stonehearth:game_mode:normal',
                  biome_src : biome
               };

               radiant.call_obj('stonehearth.game_creation', 'new_game_command', width, height, seed, options)
                  .done(function(e) {
                     var map = e.map;

                     var x, y;
                     // XXX, in the future this will make a server call to
                     // get a recommended start location, perhaps with
                     // a difficulty selector
                     do {
                        x = Math.floor(Math.random() * map[0].length);
                        y = Math.floor(Math.random() * map.length);
                     } while (map[y][x].terrain_code.indexOf('plains') != 0);

                     radiant.call_obj('stonehearth.game_creation', 'generate_start_location_command', x, y, e.map_info);
                     radiant.call('stonehearth:get_world_generation_progress')
                        .done(function(o) {
                           self.trace = radiant.trace(o.tracker)
                              .progress(function(result) {
                                 if (result.progress == 100) {
                                    //TODO, put down the camp standard.

                                    self.trace.destroy();
                                    self.trace = null;

                                    self.destroy();
                                 }
                              })
                        });
                  })
                  .fail(function(e) {
                     console.error('new_game failed:', e)
                  });
            });
      },

      exit: function() {
         radiant.call_obj('stonehearth.analytics', 'game_exit_command')
            .always(function(e) {
               radiant.call('radiant:exit');
            });
      },

      about: function() {

      }
   },

   _populateAboutDetails: function(o) {
      var window = $('#aboutDetails');

      window.html('<table>');

      for (var property in o) {
         if (o.hasOwnProperty(property)) {
            window.append('<tr><td>' + property + '<td>' + o[property])
         }
      }

      window.append('</table>');
   }
});
