<?php

    if(!defined("__IN_SYMPHONY__")) die("<h2>Error</h2><p>You cannot directly access this file</p>");

    require_once EXTENSIONS . '/algolia_search/vendor/autoload.php';

    class contentExtensionAlgolia_searchSync extends AdministrationPage
    {

        public function __construct()
        {
            parent::__construct();
        }

        public function __viewIndex()
        {
            if (isset($_POST['action']['sync'])) {
                $sections = SectionManager::select()->execute()->rows();
                $entries = array();

                foreach ($sections as $key => $section) {
                    $sectionentries = EntryManager::select()->section($section->get('id'))->includeAllFields()->execute()->rows();
                    array_push($entries, $sectionentries);
                }

                foreach ($entries as $key => $entry) {
                    if (!empty($entry)) {
                        var_dump($entry);
                        die();
                    }
                }

                var_dump($entries);
                die();
            } else {
                $this->appendSubheading(__('Algolia Search Sync'));
                $this->setTitle(__('%1$s &ndash; %2$s', array(__('Symphony'), __('Algolia Search Sync'))));

                $syncBtn = Widget::Input('action[sync]', 'Force Sync', 'submit');
                $this->Form->appendChild($syncBtn);
            }
        }

    }
