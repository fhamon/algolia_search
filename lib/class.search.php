<?php

    require_once EXTENSIONS . '/algolia_search/vendor/autoload.php';

    class Search {

        private function getIndex () {
            $config = Symphony::Configuration()->get('algolia_search');
            $client = \Algolia\AlgoliaSearch\SearchClient::create($config['app_id'], $config['key']);
            return $client->initIndex($config['index']);
        }

        public static function index($data) {
            $index = self::getIndex();
            $index->partialUpdateObjects(array($data), array(
                'createIfNotExists' => true,
            ));
        }

        public static function delete($ids) {
            $index = self::getIndex();
            $index->deleteObjects($ids);
        }

    }
