<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Styling;

use RuntimeException;

/** The site's stylesheet does not compile: the message is Tailwind's own. */
final class StylingException extends RuntimeException {}
