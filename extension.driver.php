<?php

    /**
     * @author Deux Huit Huit
     * Copyight: Deux Huit Huit 2018
     * LICENCE: MIT http://deuxhuithuit.mit-license.org;
     */

    if(!defined("__IN_SYMPHONY__")) die("<h2>Error</h2><p>You cannot directly access this file</p>");

    require_once EXTENSIONS . '/algolia_search/lib/class.search.php';

    class extension_algolia_search extends Extension {

        public function getSubscribedDelegates() {
            return array(
                array(
                    'page'		=> '/publish/new/',
                    'delegate'	=> 'EntryPostCreate',
                    'callback'	=> 'onEntryCreate'
                ),
                array(
                    'page'		=> '/publish/edit/',
                    'delegate'	=> 'EntryPostEdit',
                    'callback'	=> 'onEntryEdit'
                ),
                array(
                    'page'		=> '/publish/',
                    'delegate'	=> 'EntryPostDelete',
                    'callback'	=> 'onEntryDelete'
                ),
                array(
                    'page' => '/backend/',
                    'delegate' => 'InitaliseAdminPageHead',
                    'callback' => 'initaliseAdminPageHead'
                ),
                array(
                    'page' => '/blueprints/sections/',
                    'delegate' => 'SectionPreDelete',
                    'callback' => 'onSectionPreDelete'
                )
            );
        }

        public function initaliseAdminPageHead($context) {
            $config = Symphony::Configuration()->get('algolia_search');
            $javaScript.= "var algoliaIndex   = '".$config['index']."';\n";
            $javaScript.= "var algoliaKey   = '".$config['key']."';\n";
            $javaScript.= "var algoliaAppId   = '".$config['app_id']."';\n";
            $javaScript.= "var algoliaDefaultFields   = '".json_encode($config['default_label_fields'])."';\n";

            $tag = new XMLElement('script', $javaScript, array('type'=>'text/javascript'));

            Administration::instance()->Page->addElementToHead($tag);

            Administration::instance()->Page->addStylesheetToHead(URL . '/extensions/algolia_search/assets/search.css');
            Administration::instance()->Page->addScriptToHead('https://cdnjs.cloudflare.com/ajax/libs/algoliasearch/3.31.0/algoliasearch.min.js');
            Administration::instance()->Page->addScriptToHead(URL . '/extensions/algolia_search/assets/search.js');
        }

        public function appendPreferences($context)
        {
            //
        }

        private function formatObject($context) {
            $entry = EntryManager::select()
                        ->entry($context['entry']->get('id'))
                        ->section($context['section']->get('id'))
                        ->includeAllFields()
                        ->execute()
                        ->next();

            $computedData = array(
                'section' => $context['section']->get('name'),
                'section-handle' => $context['section']->get('handle'),
                'entry' => $entry->get('id'),
                'author' => AuthorManager::select()->author($entry->get('author_id'))->execute()->next()->get('username'),
                'objectID' => $entry->get('id'),
            );

            foreach ($entry->getData() as $key => $data) {
                $field = FieldManager::select()->field($key)->execute()->next();

                unset($data['handle']);

                if (class_exists('FLang')) {
                    foreach (FLang::getLangs() as $lc) {
                        unset($data['handle-' . $lc]);
                    }
                }

                $computedData[$field->get('element_name')] = $data;
            }

            return $computedData;
        }

        public function onEntryCreate($context)
        {
            Search::index($this->formatObject($context));
        }

        public function onEntryEdit($context)
        {
            Search::index($this->formatObject($context));
        }

        public function onEntryDelete($context)
        {
            Search::delete($context['entry_id']);
        }

        public function onSectionPreDelete($context) {
            $ids = array();
            foreach ($context['section_ids'] as $section) {
                $entries = EntryManager::select()->section($section)->execute()->rows();

                foreach ($entries as $key => $entry) {
                    $ids[] = $entry->get('id');
                }
            }
            Search::delete($ids);
        }

        public function fetchNavigation() {
            if (!Symphony::Author()->isDeveloper()) {
                return array();
            }
            
            return array(
                array(
                    'location' => 'Algolia',
                    'name' => __('Algolia'),
                    'limit' => null,
                    'children' => array(
                        array(
                            'name'  => __('Algolia'),
                            'link'  => '/sync'
                        ),
                    )
                )
            ); 
        }

    }
