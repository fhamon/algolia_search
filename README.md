# Algolia Search

Find entries super fast. Like, crazy fast.

## Installation
- Just like every Symphony extensions. Clone this repo inside `/extensions` of your Symphony installation and head to `/symphony/system/extensions/` to install it.

## Configuration
You need few things in your `config.php` to get this running.

```php
'algolia_search' => array(
	'index' => '<YOUR INDEX CODE>',
	'app_id' => '<YOUR APP ID>',
	'key' => '<YOUR API KEY>',
	'default_label_fields' => array('title', 'identifier', 'handle')
),
```

Note: This is still an experimental extension and I do have intentions to fully release it when the time will come. It's still buggy and only compatible with Symphony 4 alpha 3 and no plans are made to make it retro compatible.

Planned features:
- Sync all entries at installation
- Custom results template by sections
- Feel free to open an issue (or a pull request ;) if you have the best idea in the world
